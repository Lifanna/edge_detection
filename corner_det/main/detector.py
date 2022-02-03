from .mask09calc import Mask09Calc90, Mask09Calc45
from .convolute import convolute
import cv2 as cv
import numpy as np
import os.path
from .models import Image as ImageModel

def detect(image_path, angle, threshold, image_id):
    M = 512
    N = 512 
    Image = np.zeros((M, N))

    # Image = cv.imread('C:/PythonProjects/edge_detection/fig2.jpg')
    SITE_ROOT = os.path.dirname(os.path.realpath(__file__)).replace('\\', '/')
    main_folder = SITE_ROOT.split('/')[-1]
    SITE_ROOT = SITE_ROOT.replace(main_folder, '')
    SITE_ROOT = SITE_ROOT[:-1]
    print("SSSSSSSSSSSSSS:         ", SITE_ROOT + image_path)
    
    ImageFile = cv.imread(SITE_ROOT + image_path)
    # dim = (64, 64)
    # Image = cv.resize(Image, dim, interpolation = cv.INTER_AREA)
    
    [M, N, channels] = np.shape(ImageFile)
    Image = cv.cvtColor(ImageFile, cv.COLOR_RGB2GRAY)

    Edges = np.zeros((M, N))
    Corners = np.zeros((M, N))
    n = 9
    Mask = np.zeros((n, n))
    Mask09 = np.zeros((8, n, n))
    
    # if angle == "45":
    Mask09 = Mask09Calc45()
    # elif angle == "45":
    #     Mask09 = Mask09Calc90()

    Conv = np.zeros(8)
    np.vectorize(Conv)
    W = np.zeros((9, 9))

    for i in range(0, (M - n + 1)):
        for j in range(0, (N - n + 1)):
            # Заполнение фрагмента W сканированными элементами изображения и одновременно вычисление w0 среднего значения яркостей изображения во фрагменте 
            w0=0
            for p in range(1, n):
                for q in range(1, n):
                    W[p, q] = Image[i + p - 1, j + q - 1]
                    # w0 = w0 + W(p,q)
        
            # Прочитали изображение во фрагмент (сканировали скользящим окном)
            # Вычисляем среднее:
            w0 = np.sum(W)
            w0 = w0 / (n * n)
            # Свертка фрагмента с каждой из 8 масок     
            for s in range(0, 8):
                # Заполнение временного рабочего массива
                Mask[:,:] = Mask09[s, :, :]
                # Свертка s –й маски с фрагментом
                Conv[s] = convolute(W, Mask, n)

            # Свертка в восьми направлениях вычислена
            # Нормализация средним значением фрагмента
            # Вычисление максимума модулей значений массива Conv, нормализация средним по фрагменту и занесение этого значения в массив границ и углов Edges в точке (i,j):
            
            Edges[i, j] = np.max(np.abs(Conv)) / (w0 + 0.0001)


    # Вычисление максимального и минимального значений массива Edges операторами Матлаб max, min:
    MaxEdge = np.max(Edges)
    MinEdge = np.min(Edges)
    # Коэффициент растяжения (сжатия) динамического диапазона:
    coeff = (255 - MinEdge) / (MaxEdge - MinEdge)
    # Приведение значений массива Edges в стандартный диапазон цифровых изображений [0-255], используя поэлементное умножение матриц на скаляр в синтаксисе языка Матлаб и функцию округления до целых неотрицательных:
    Edges = np.uint8(coeff * Edges) 

    # Порог выбирается различными способами, например, по гистограмме яркостей. В простейшем случае подбором
    Threshold = threshold
    print("Порог изображения равен:      ", Threshold, MaxEdge, MinEdge)
    for i in range(0, M):
        for j in range(0, N):
            # 255 - условно самая яркая точка или пиксель
            if Edges[i, j] > 160: 
                Corners[i, j] = 255 
                # rectangle('Position',[i,j,10,10],'EdgeColor','r','Linewidth',3)
        
    # C = cv.imfuse(Image, Corners)

    from PIL import Image as PILImage

    C = np.dstack((Image, Corners, Image))
    file_extension = image_path.split('.')[-1]
    image_path = image_path[:-len(file_extension)]
    image_path = image_path[:-1]

    cv.imwrite(SITE_ROOT + image_path + '_detected.jpg', C)
    from django.core.files import File

    image = ImageModel(path=image_path + '_detected.jpg', image_file=File(C))
    image.save()


    blurred = salt_pepper(ImageFile)

    # записываем в файл несколько изображений: размытое, с краями, с углами
    cv.imwrite(SITE_ROOT + image_path + '_blurred.jpg', blurred)
    cv.imwrite(SITE_ROOT + image_path + '_with_edges.jpg', Edges)
    cv.imwrite(SITE_ROOT + image_path + '_detected.jpg', C)
    image_object = ImageModel.objects.get(id=image_id)
    image_object.path = image_path + '.jpg' 
    image_object.blurred_path = image_path + '_blurred.jpg' 
    image_object.edges_path = image_path + '_with_edges.jpg' 
    image_object.detected_path = image_path + '_detected.jpg' 
    image_object.image_file = File(C)
    image_object.blurred_image_file = File(blurred)
    image_object.edges_image_file = File(Edges)
    image_object.detected_image_file = File(C)
    image_object.save()

    return image_path + '.jpg', image_path + '_blurred.jpg', image_path + '_with_edges.jpg', image_path + '_detected.jpg'

    # cv.imshow('Corners', Corners)
    # cv.waitKey(0)
    # cv.destroyAllWindows()

def salt_pepper(image):
    row, col, ch = image.shape
    s_vs_p = 0.7
    amount = 0.007
    out = np.copy(image)
    # Salt mode
    num_salt = np.ceil(amount * image.size * s_vs_p)
    coords = [np.random.randint(0, i - 1, int(num_salt))
            for i in image.shape]
    out[coords] = 1

    # Pepper mode
    num_pepper = np.ceil(amount* image.size * (1. - s_vs_p))
    coords = [np.random.randint(0, i - 1, int(num_pepper))
            for i in image.shape]
    out[coords] = 0

    return out
