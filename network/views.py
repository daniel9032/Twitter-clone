from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.base import ContentFile
from django.core.cache import cache
from django.contrib.auth.decorators import login_required
from json import loads
from base64 import b64decode
from PIL import Image
from io import BytesIO
from uuid import uuid4

from .models import User, Post, Follower


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def users(request, username: str):
    try:
        user = cache_user(username)
        return render(request, "network/users.html", {'user': user})

    except User.DoesNotExist:
        return render(request, "network/error.html")


def follower(request, username: str):
    try:
        user = cache_user(username)
        return render(request, "network/follower_following.html", {
            'user': user, 
            'follower_following': 'follower', 
            'request_user': request.user
        })

    except User.DoesNotExist:
        return render(request, "network/error.html")


def following(request, username: str):
    try:
        user = cache_user(username)
        return render(request, "network/follower_following.html", {
            'user': user,
            'follower_following': 'following',
            'request_user': request.user
        })

    except User.DoesNotExist:
        return render(request, "network/error.html")


def status(request, post_id: int):
    if Post.objects.filter(pk=post_id).exists():
        return render(request, "network/status.html", {
            'post_id': post_id
        })
    else:
        return render(request, "network/error.html")


@login_required(login_url='/login')
def feed_following(request):
    return render(request, "network/feed_following.html")


#-----------------------------------API calls-----------------------------------


def like(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=405)

    request_user = request.user
    if not request_user.is_authenticated:
        return JsonResponse({"message": "User is not logged in.", "action": "prompt_loggin"}, status=200)

    data = loads(request.body)
    post_id = data.get("post_id")
    try:
        post = cache_post(post_id)
        if post in request_user.liked_post.all():
            request_user.liked_post.remove(post)
            return JsonResponse({"message": "Post unliked.", "action": "switch_to_like"}, status=200)
        else:
            post.like.add(request_user)
            return JsonResponse({"message": "Post liked.", "action": "switch_to_unlike"}, status=200)

    except Post.DoesNotExist:
        return JsonResponse({"error": "Requested post does not exist."}, status=404)


def check_is_liked(request):
    if request.method != 'GET':
        return JsonResponse({"error": "GET request required."}, status=405)
    request_user = request.user
    if not request_user.is_authenticated:
        return JsonResponse({"is_liked": False}, status=200)

    if 'post_id' in request.GET:
        post_id = request.GET['post_id']
        try:
            post = cache_post(post_id)
            if post in request_user.liked_post.all():
                return JsonResponse({"is_liked": True}, status=200)
            else:
                return JsonResponse({"is_liked": False}, status=200)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Requested post does not exist."}, status=404)
    else:
        return JsonResponse({"error": "Query parameter 'post_id' is required."}, status=400)


def follow_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=405)

    data = loads(request.body)
    if data is not None:
        username = data.get('username')
        try:
            user = cache_user(username)
            request_user = request.user
            if Follower.objects.filter(user=user).exists():
                follower = Follower.objects.get(user=user)
                follower.follower.add(request_user)
            else:
                follower = Follower(user=user)
                follower.save()
                follower.follower.add(request_user)

            return JsonResponse({"message": "Followed."}, status=200)

        except User.DoesNotExist:
            return JsonResponse({"error": "Requested user does not exist."}, status=404)
    else:
        return JsonResponse({"error": "Query parameter 'username' is required."}, status=400)


def unfollow_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=405)

    data = loads(request.body)
    if data is not None:
        username = data.get('username')
        try:
            user = cache_user(username)
            follower = Follower.objects.get(user=user)
            request_user = request.user
            request_user.following.remove(follower)

            return JsonResponse({"message": "Unfollowed."}, status=200)

        except User.DoesNotExist:
            return JsonResponse({"error": "Requested user does not exist."}, status=404)
    else:
        return JsonResponse({"error": "Query parameter 'username' is required."}, status=400)


def post(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "User is not logged in."}, status=404)
        data = loads(request.body)
        body = data.get("body")
        image = data.get("image") if "image" in data else None
        is_public = True
        parent_post = None

        if "parent_post_id" in data:
            parent_post_id = data.get("parent_post_id")
            try:
                if parent_post_id:
                    parent_post_id = int(parent_post_id)
                    parent_post = cache_post(parent_post_id)
                else:
                    parent_post = None
            except:
                return JsonResponse({"error": "Requested parent_post_id's format is incorrect."}, status=400)
        new_post = Post(
            user=request.user,
            body=body,
            is_public=is_public,
            parent_post=parent_post,
        )
        if image:
            file_type = image.split(',')[0].split('/')[1].split(';')[0]
            image_file_name = uuid4()
            preview_image_file_name = uuid4()
            image = b64decode(image.split(',')[-1])
            image = Image.open(BytesIO(image))
            width, height = image.size
            preview_image = image.resize((width * 2 // 3, height *2 // 3))

            buffer = BytesIO()
            image.save(fp=buffer, format=file_type)
            image.close()
            image = ContentFile(buffer.getvalue())
            new_post.image.save(f'{image_file_name}.{file_type}', InMemoryUploadedFile(
                    image,                                          # file
                    None,                                           # field_name
                    f'{image_file_name}.{file_type}',               # file name
                    f'image/{file_type}',                           # content_type
                    image.tell,                                     # size
                    None,                                           # content_type_extra
                )
            )

            buffer = BytesIO()
            preview_image.save(fp=buffer, format=file_type)
            preview_image = ContentFile(buffer.getvalue())
            new_post.preview_image.save(f'{preview_image_file_name}.{file_type}', InMemoryUploadedFile(
                    preview_image,                                  # file
                    None,                                           # field_name
                    f'{preview_image_file_name}.{file_type}',       # file name
                    f'image/{file_type}',                           # content_type
                    preview_image.tell,                             # size
                    None,                                           # content_type_extra
                )
            )
        new_post.save()

        return JsonResponse({"message": "Post created."}, status=201)

    elif request.method == "GET":
        PAGE_SIZE = 10

        if 'operation' in request.GET:
            operation = request.GET['operation']

            # All posts
            if operation == 'all':
                if 'cursor' in request.GET:
                    cursor = request.GET['cursor']
                    # using prefetch_related to avoid N + 1 problem
                    posts = Post.objects.filter(id__lt=cursor).order_by('-timestamp')[:PAGE_SIZE].prefetch_related('user')
                    if not posts:
                        return JsonResponse([{"is_end": True}], safe=False)
                    return JsonResponse([{'cursor': posts[len(posts) - 1].id}] + [post.serialize() | {'user': post.user.username} for post in posts], safe=False)
                else:
                    return JsonResponse({"error": "Query parameter 'cursor' is required."}, status=400)

            else:
                if 'username' in request.GET:
                    username = request.GET['username']
                    cursor = request.GET['cursor']

                    # All posts from user
                    if operation == 'user':
                        try:
                            user = User.objects.get(username=username)
                            posts = Post.objects.filter(user=user, id__lt=cursor).order_by('-timestamp')[:PAGE_SIZE]
                            if not posts:
                                return JsonResponse([{"is_end": True}], safe=False)

                            return JsonResponse([{'cursor': posts[len(posts) - 1].id}] + [post.serialize() | {'user': username} for post in posts], safe=False)
                        except User.DoesNotExist:
                            return JsonResponse({"error": "Requested user does not exist."}, status=404)

                    # All posts from all people whom the user is following
                    elif operation == 'following':
                        try:
                            user = User.objects.get(username=username)
                            following_list = user.following.all().select_related('user')
                            if following_list:
                                posts = Post.objects.filter(user__in=[following.user for following in following_list], id__lt=cursor).order_by('-timestamp')[:PAGE_SIZE].prefetch_related('user')
                                if not posts:
                                    return JsonResponse([{"is_end": True}], safe=False)
                                return JsonResponse([{'cursor': posts[len(posts) - 1].id}] + [post.serialize() | {'user': post.user.username} for post in posts], safe=False)
                            else:
                                return JsonResponse({"message": "You're not following anyone."}, status=200)

                        except User.DoesNotExist:
                            return JsonResponse({"error": "Requested user does not exist."}, status=404)

                    else:
                        return JsonResponse({"error": "Invalid operation received."}, status=400)

                elif 'post_id' in request.GET:
                    post_id = request.GET['post_id']
                    if 'cursor' in request.GET:
                        cursor = request.GET['cursor']

                    # Get parent post
                    if operation == 'parent':
                        try:
                            post_id = int(post_id)

                        except ValueError:
                            return JsonResponse({"error": "Requested post_id's format is incorrect."}, status=400)
                        try:
                            posts = []
                            post = cache_post(post_id)
                            posts.append(post)
                            while post.parent_post:
                                post_id = post.parent_post.id
                                post = cache_post(post_id)
                                posts.append(post)
                            return JsonResponse([post.serialize() | {'user': post.user.username} for post in posts], safe=False)
                        except Post.DoesNotExist:
                            return JsonResponse({"error": "Requested post does not exist."}, status=404)

                    # Get child posts from parent_post id
                    elif operation == 'child':
                        try:
                            post_id = int(post_id)

                        except ValueError:
                            return JsonResponse({"error": "Requested post_id's format is incorrect."}, status=400)

                        if Post.objects.filter(parent_post=post_id).exists():
                            posts = Post.objects.filter(parent_post=post_id, id__lt=cursor).order_by('-timestamp').prefetch_related('user')[:PAGE_SIZE]
                            if not posts:
                                return JsonResponse([{"is_end": True}], safe=False)
                            return JsonResponse([{'cursor': posts[len(posts) - 1].id}] + [post.serialize() | {'user': post.user.username} for post in posts], safe=False)

                        else:
                            return JsonResponse([{"is_end": True}], safe=False)
                else:
                    return JsonResponse({"error": "Id or username is required."}, status=400)

    elif request.method == 'PUT':
        if 'post_id' in request.GET:
            try:
                post_id = request.GET['post_id']
                post_id = int(post_id)
                request_user = request.user
                if cache.get(key=f'post_{post_id}'):
                    post = cache.get(key=f'post_{post_id}')
                else:
                    post = Post.objects.get(pk=post_id)
                if request_user.is_authenticated and request_user == post.user:
                    data = loads(request.body)
                    body = data.get("body")
                    post.body = body
                    post.save(update_fields=['body'])

                    if cache.get(key=f'post_{post_id}'):
                        cache.delete(key=f'post_{post_id}')
                    return JsonResponse({"message": "Post edited."}, status=200)
                else:
                    return JsonResponse({"error": "Access denied. Not the original poster."}, status=403)

            except Post.DoesNotExist:
                return JsonResponse({"error": "Requested post does not exist."}, status=404)

            except ValueError:
                return JsonResponse({"error": "Requested post id's format is incorrect."}, status=400)
        else:
            return JsonResponse({"error": "post id is required."}, status=400)

    elif request.method == 'DELETE':
        if 'post_id' in request.GET:
            try:
                post_id = request.GET['post_id']
                post_id = int(post_id)
                post = Post.objects.get(pk=post_id)
                if request.user.is_authenticated and request.user == post.user:
                    post.image.delete()
                    post.preview_image.delete()
                    post.delete()
                    return JsonResponse({"message": "Post deleted."}, status=200)
                else:
                    return JsonResponse({"error": "Access denied. Not the original poster."}, status=403)

            except Post.DoesNotExist:
                return JsonResponse({"error": "Requested post does not exist."}, status=404)

            except ValueError:
                return JsonResponse({"error": "Requested post id's format is incorrect."}, status=400)
        else:
            return JsonResponse({"error": "post id is required."}, status=400)

    else:
        return JsonResponse({"error": "POST, GET, PUT or DELETE request required."}, status=405)


def get_follower(request):
    if request.method != 'GET':
        return JsonResponse({"error": "GET request required."}, status=405)

    if 'username' in request.GET:
        username = request.GET['username']
        try:
            user = cache_user(username)
            follower = Follower.objects.get(user=user)
            follower_list = follower.follower.all().select_related('user')

            return JsonResponse([follower.user.username for follower in follower_list], safe=False)

        except User.DoesNotExist:
            return JsonResponse({"error": "Requested user does not exist."}, status=404)

        except Follower.DoesNotExist:
            return JsonResponse([], safe=False)
    else:
        return JsonResponse({"error": "Query parameter 'username' is required."}, status=400)


def get_following(request):
    if request.method != 'GET':
        return JsonResponse({"error": "GET request required."}, status=405)

    if 'username' in request.GET:
        username = request.GET['username']
        try:
            user = cache_user(username)
            following_list = user.following.all().select_related('user')

            return JsonResponse([following.user.username for following in following_list], safe=False)

        except User.DoesNotExist:
            return JsonResponse({"error": "Requested user does not exist."}, status=404)
    else:
        return JsonResponse({"error": "Query parameter 'username' is required."}, status=400)


def get_follower_count(request):
    if request.method != 'GET':
        return JsonResponse({"error": "GET request required."}, status=405)

    if 'username' in request.GET:
        username = request.GET['username']
        try:
            user = cache_user(username)
            follower_count = 0
            if Follower.objects.filter(user=user).exists():
                follower = Follower.objects.get(user=user)
                follower_count = follower.follower.count()
            return JsonResponse({"follower_count": follower_count})

        except User.DoesNotExist:
            return JsonResponse({"error": "Requested user does not exist."}, status=404)
    else:
        return JsonResponse({"error": "Query parameter 'username' is required."}, status=400)


def get_following_count(request):
    if request.method != 'GET':
        return JsonResponse({"error": "GET request required."}, status=405)

    if 'username' in request.GET:
        username = request.GET['username']
        try:
            user = User.objects.get(username=username)
            following_count = user.following.count()
            return JsonResponse({"following_count": following_count})

        except User.DoesNotExist:
            return JsonResponse({"error": "Requested user does not exist."}, status=404)
    else:
        return JsonResponse({"error": "Query parameter 'username' is required."}, status=400)


def get_like_number(request):
    if request.method != 'GET':
        return JsonResponse({"error": "GET request required."}, status=405)

    if 'post_id' in request.GET:
        post_id = request.GET['post_id']
        try:
            post = cache_post(post_id)
            like_number = post.like.count()
            return JsonResponse({"like_number": like_number})

        except Post.DoesNotExist:
            return JsonResponse({"error": "Requested post does not exist."}, status=404)
    else:
        return JsonResponse({"error": "Query parameter 'post_id' is required."}, status=400)


def get_message_number(request):
    if request.method != 'GET':
        return JsonResponse({"error": "GET request required."}, status=405)

    if 'post_id' in request.GET:
        post_id = request.GET['post_id']

        if Post.objects.filter(parent_post=post_id).exists():
            message_number = cache_message_number(post_id)
            return JsonResponse({"message_number": message_number})
        else:
            return JsonResponse({"message_number": 0})
    else:
        return JsonResponse({"error": "Query parameter 'post_id' is required."}, status=400)


def check_is_following(request):
    if request.method != 'GET':
        return JsonResponse({"error": "GET request required."}, status=405)

    if 'username' in request.GET:
        username = request.GET['username']
        request_user = request.user
        if not request_user.is_authenticated:
            return JsonResponse({"error": "Requested user is not logged in."}, status=404)
        try:
            user = User.objects.get(username=username)
            follower = Follower.objects.get(user=user)
            is_following = False
            if follower in request_user.following.all():
                is_following = True
            return JsonResponse({"is_following": is_following}, status=200)

        except User.DoesNotExist:
            return JsonResponse({"message": "Requested user does not exist."}, status=404)

        except Follower.DoesNotExist:
            return JsonResponse({"is_following": False}, status=200)

        except AttributeError:
            return JsonResponse({"is_following": False}, status=200)
    else:
        return JsonResponse({"error": "Query parameter 'username' is required."}, status=400)


def check_is_original_poster(request):
    if request.method != 'GET':
        return JsonResponse({"error": "GET request required."}, status=405)

    if 'post_id' in request.GET:
        post_id = request.GET['post_id']
        reques_user = request.user
        if not reques_user.is_authenticated:
            return JsonResponse({"is_original_poster": False}, status=200)
        try:
            if Post.objects.filter(pk=post_id, user=reques_user).exists():
                return JsonResponse({"is_original_poster": True}, status=200)
            else:
                return JsonResponse({"is_original_poster": False}, status=200)

        except Post.DoesNotExist:
            return JsonResponse({"error": "Requested post does not exist."}, status=404)

    else:
        return JsonResponse({"error": "Query parameter 'post_id' is required."}, status=400)


#----------------------------------caching functions----------------------------------


def cache_post(post_id):
    if not cache.get(key=f'post_{post_id}'):
        post = Post.objects.get(pk=post_id)
        cache.set(
            key=f'post_{post_id}',
            value=post,
            timeout=60 * 5
        )
    return cache.get(f'post_{post_id}')


def cache_user(username):
    if not cache.get(key=f'user_{username}'):
        user = User.objects.get(username=username)
        cache.set(
            key=f'user_{username}',
            value=user,
            timeout=60 * 15
        )
    return cache.get(f'user_{username}')


def cache_message_number(post_id):
    if not cache.get(key=f'post_message_number_{post_id}'):
        message_number = Post.objects.filter(parent_post=post_id).count()
        cache.set(
            key=f'post_message_number_{post_id}',
            value=message_number,
            timeout=60 * 2
        )
    return cache.get(f'post_message_number_{post_id}')
