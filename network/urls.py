from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("users/<str:username>", views.users, name="users"),
    path("users/<str:username>/follower", views.follower, name="follower"),
    path("users/<str:username>/following", views.following, name="following"),
    path("status/<str:post_id>", views.status, name="status"),
    path("feed/following", views.feed_following, name="feed_following"),

    # API calls
    path("post", views.post, name="post"),
    path("like", views.like, name="like"),
    path("repost", views.share_post, name="share_post"),
    path("follow", views.follow_user, name="follow_user"),
    path("unfollow", views.unfollow_user, name="unfollow_user"),
    path("like_number", views.get_like_number, name="get_like_number"),
    path("message_number", views.get_message_number, name="get_message_number"),
    path("repost_number", views.get_repost_number, name="get_repost_number"),
    path("is_liked", views.check_is_liked, name="check_is_liked"),
    path("is_shared", views.check_is_shared, name="check_is_shared"),
    path("is_following", views.check_is_following, name="check_is_following"),
    path("is_original_poster", views.check_is_original_poster, name="check_is_original_poster"),
    path("follower", views.get_follower, name="get_follower"),
    path("following", views.get_following, name="get_following"),
    path("follower_count", views.get_follower_count, name="get_follower_count"),
    path("following_count", views.get_following_count, name="get_following_count"),
]
