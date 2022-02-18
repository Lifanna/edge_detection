from django.http.response import JsonResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from .forms import ImageForm
from .detector2 import detect
from .detectorHarris import detect_harris
from datetime import date, datetime
from .models import Image
from django.views.decorators.csrf import csrf_exempt
import os
from .chart_builder import get_chart_data

def index(request):
    return render(request, 'main/index.html')

@csrf_exempt
def analyse(request):
    destination = request.POST.get('destination')
    blurred = request.POST.get('blurred')
    with_edges = request.POST.get('with_edges')
    detected = request.POST.get('detected')

    
    pix_destination, pix_blurred, pix_with_edges, pix_detected = get_chart_data(destination, blurred, with_edges, detected)

    return JsonResponse({
        'destination': pix_destination,
        'blurred': pix_blurred,
        'withEdges': pix_with_edges,
        'detected': pix_detected,
    })
    # def upload_image(request):
#     if request.method == 'POST':
#         form = UploadFileForm(request.POST, request.FILES)
#         if form.is_valid():
#             now = datetime.now()
#             date_time = now.strftime("%d_%m_%Y_%H_%M_%S")
#             print("date and time:     ", date_time)
#             image = models.Image(path = "images/%s/"%date_time, image_file=request.FILES['file'])
#             image.save()

#             detector.detect()
#             return HttpResponseRedirect('/success/url/')
#     else:
#         form = UploadFileForm()
#     return render(request, 'upload.html', {'form': form})

@csrf_exempt
def upload_image(request):
    if request.method == 'POST':
        form = ImageForm(request.POST.get('file'), request.FILES)
        fileName, fileExtension = os.path.splitext(request.POST.get('filename'))
        
        if fileExtension != ".jpeg":
            if fileExtension != ".jpg":
                return JsonResponse({'error': 'err', 'message': 'Файл с неправильным форматом'})
        # if form.is_valid():
        now = datetime.now()
        date_time = now.strftime("%d_%m_%Y_%H_%M_%S")
        image = Image(path = "images/%s/"%date_time, image_file=request.FILES['file'])
        image.save()

        uploaded_path = image.image_file.url
        threshold = request.POST.get('threshold')
        angle = request.POST.get('angle')
        scale = request.POST.get('scale')
        
        try:
            # detected_path = detect(uploaded_path, angle, int(threshold))
            image_path, blurred_path, with_edges_path, detected_path = detect(uploaded_path, angle, scale, int(threshold), image.id)

            # image = Image.objects.get(path=detected_path)
            return JsonResponse({
                'imageID': image.id,
                'error': 'no',
                'destination': image_path,
                'blurred': blurred_path,
                'withEdges': with_edges_path,
                'detected': detected_path,
            })
        except Exception as e:
            import traceback, sys
            print(traceback.format_exc())
            # print(sys.exc_info()[2])
            return JsonResponse({'error': 'err', 'message': 'Внутренняя ошибка сервера'})
    # else:
    #     return JsonResponse({'error': 'file does not saved'})
        # form = ImageForm()
    return JsonResponse({'error': 'err', 'message': 'Внутренняя ошибка сервера'})

@csrf_exempt
def upload_image_harris(request):
    if request.method == 'POST':
        form = ImageForm(request.POST.get('file'), request.FILES)
        fileName, fileExtension = os.path.splitext(request.POST.get('filename'))
        
        if fileExtension != ".jpeg":
            if fileExtension != ".jpg":
                return JsonResponse({'error': 'err', 'message': 'Файл с неправильным форматом'})
        # if form.is_valid():
        now = datetime.now()
        date_time = now.strftime("%d_%m_%Y_%H_%M_%S")
        image = Image(path = "images/%s/"%date_time, image_file=request.FILES['file'])
        image.save()

        uploaded_path = image.image_file.url
        block_size = request.POST.get('blockSize')
        kernel_size = request.POST.get('ksize')
        k = request.POST.get('k')
        
        try:
            detected_path = detect_harris(uploaded_path, block_size, kernel_size, k, image.id)

            return JsonResponse({
                'imageID': image.id,
                'error': 'no',
                'destination': uploaded_path,
                'detected': detected_path,
            })
        except Exception as e:
            import traceback, sys
            print(traceback.format_exc())
            # print(sys.exc_info()[2])
            return JsonResponse({'error': 'err', 'message': 'Внутренняя ошибка сервера'})
    # else:
    #     return JsonResponse({'error': 'file does not saved'})
        # form = ImageForm()
    return JsonResponse({'error': 'err', 'message': 'Внутренняя ошибка сервера'})
