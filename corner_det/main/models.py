from django.db import models

# Create your models here.
class Image(models.Model):
    path = models.CharField("path", max_length=255, null=True)
    blurred_path = models.CharField("blurred_path", max_length=255, null=True)
    edges_path = models.CharField("edges_path", max_length=255, null=True)
    detected_path = models.CharField("detected_path", max_length=255, null=True)

    image_file = models.ImageField(upload_to='images/%d_%m_%Y_%H_%M_%S/', blank=True, null=True)
    blurred_image_file = models.ImageField(upload_to='images/%d_%m_%Y_%H_%M_%S/blurred/', blank=True, null=True)
    edges_image_file = models.ImageField(upload_to='images/%d_%m_%Y_%H_%M_%S/edges/', blank=True, null=True)
    detected_image_file = models.ImageField(upload_to='images/%d_%m_%Y_%H_%M_%S/detected/', blank=True, null=True)
