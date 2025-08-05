from django.http import JsonResponse

def api_info(request):
    return JsonResponse({
        'message': 'Feedback Collection Platform API',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'auth': '/api/auth/',
            'forms': '/api/forms/',
            'responses': '/api/responses/'
        }
    })
