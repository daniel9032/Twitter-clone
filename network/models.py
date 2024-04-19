from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from dateutil.relativedelta import relativedelta

class User(AbstractUser):
    pass

    class Meta:
        indexes = [models.Index(fields=['username'])]


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post')
    body = models.CharField(max_length=500)
    parent_post = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField()
    like = models.ManyToManyField(User, related_name='liked_post')
    image = models.ImageField(upload_to='uploads/', null=True, blank=True)
    preview_image = models.ImageField(upload_to='preview/', null=True, blank=True)


    def human_readable_time(self):
        now = timezone.now()
        diff = relativedelta(now, self.timestamp)

        if diff.years > 0:
            return f"{diff.years} {'year' if diff.years == 1 else 'years'} ago"
        elif diff.months > 0:
            return f"{diff.months} {'month' if diff.months == 1 else 'months'} ago"
        elif diff.days > 0:
            return f"{diff.days} {'day' if diff.days == 1 else 'days'} ago"
        elif diff.hours > 0:
            return f"{diff.hours} {'hour' if diff.hours == 1 else 'hours'} ago"
        elif diff.minutes > 0:
            return f"{diff.minutes} {'minute' if diff.minutes == 1 else 'minutes'} ago"
        else:
            seconds = max(diff.seconds, 1)
            return f"{seconds} {'second' if seconds == 1 else 'seconds'} ago"

    def serialize(self):
        image_url = self.image.url if self.image else None
        preview_image_url = self.preview_image.url if self.preview_image else None
        return {
            "post_id": self.id,
            "body": self.body,
            "timestamp": self.human_readable_time(),
            "is_public": self.is_public,
            "image_url": image_url,
            "preview_image_url": preview_image_url,
        }


class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    follower = models.ManyToManyField(User, related_name='following')
