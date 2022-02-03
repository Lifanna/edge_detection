import cv2, numpy as np, os

def get_chart_data(destination, blurred, with_edges, detected):
    SITE_ROOT = os.path.dirname(os.path.realpath(__file__)).replace('\\', '/')
    main_folder = SITE_ROOT.split('/')[-1]
    SITE_ROOT = SITE_ROOT.replace(main_folder, '')
    SITE_ROOT = SITE_ROOT[:-1]

    # destination = '/images/27_01_2022_14_53_35/fig_compressed_detected.jpg'
    # blurred = '/images/27_01_2022_14_53_35/fig_compressed_blurred.jpg'
    # with_edges = '/images/27_01_2022_14_53_35/fig_compressed_with_edges.jpg'
    # detected = '/images/27_01_2022_14_53_35/fig_compressed_detected.jpg'

    img_destination = cv2.imread(SITE_ROOT + destination, 0).tolist()
    img_blurred = cv2.imread(SITE_ROOT + blurred, 0).tolist()
    img_with_edges = cv2.imread(SITE_ROOT + with_edges, 0).tolist()
    img_detected = cv2.imread(SITE_ROOT + detected, 0).tolist()

    return img_destination, img_blurred, img_with_edges, img_detected
