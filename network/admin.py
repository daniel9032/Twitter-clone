from django.contrib import admin
from .models import User, Post, Repost, Follower

# Register your models here.
admin.site.register(User)
admin.site.register(Post)
admin.site.register(Repost)
admin.site.register(Follower)