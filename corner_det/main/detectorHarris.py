import numpy as np
import cv2 as cv
from .models import Image as ImageModel
import os

def detect_harris(image_path, block_size, kernel_size, k, image_id):
    SITE_ROOT = os.path.dirname(os.path.realpath(__file__)).replace('\\', '/')
    main_folder = SITE_ROOT.split('/')[-1]
    SITE_ROOT = SITE_ROOT.replace(main_folder, '')
    SITE_ROOT = SITE_ROOT[:-1]

    img = cv.imread(SITE_ROOT + image_path)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    gray = np.float32(gray)
    dst = cv.cornerHarris(gray, int(block_size), int(kernel_size), float(k))
    # result is dilated for marking the corners, not important
    dst = cv.dilate(dst, None)
    # Threshold for an optimal value, it may vary depending on the image.
    img[dst > 0.01 * dst.max()] = [0, 0, 255]

    file_extension = image_path.split('.')[-1]
    image_path = image_path[:-len(file_extension)]
    image_path = image_path[:-1]

    cv.imwrite(SITE_ROOT + image_path + '_blurred.jpg', img)
    image_object = ImageModel.objects.get(id=image_id)
    image_object.path = image_path + '.jpg' 
    image_object.save()

    return image_path + '_blurred.jpg'
