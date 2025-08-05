from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            
            print(f"Registration attempt: username={username}, email={email}")
            
            if not username or not email or not password:
                return Response(
                    {'error': 'Username, email, and password are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if User.objects.filter(username=username).exists():
                return Response(
                    {'error': 'Username already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = User.objects.create_user(
                username=username, 
                email=email, 
                password=password
            )
            
            print(f"User created successfully: {user.username}")
            
            return Response({
                'message': 'User created successfully',
                'user': {'id': user.id, 'username': user.username}
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return Response(
                {'error': f'Registration failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            print(f"Login attempt: username={username}")
            
            user = authenticate(username=username, password=password)
            if user:
                login(request, user)
                return Response({
                    'message': 'Login successful',
                    'user': {'id': user.id, 'username': user.username}
                })
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            print(f"Login error: {str(e)}")
            return Response(
                {'error': 'Login failed. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})
