from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..services.user_service import UserService
from ..serializers.user_serializer import UserProfileSerializer

class UserProfileView(APIView):
    # For now, we use a dummy firebase_uid from headers or default it for testing since Auth is skipped
    def get_firebase_uid(self, request):
        return request.headers.get('X-Firebase-Uid', 'dummy_user_123')

    def get(self, request):
        uid = self.get_firebase_uid(request)
        profile = UserService.get_profile(uid)
        
        if not profile:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        uid = self.get_firebase_uid(request)
        serializer = UserProfileSerializer(data=request.data, partial=True)
        
        if serializer.is_valid():
            profile = UserService.update_profile(uid, serializer.validated_data)
            response_serializer = UserProfileSerializer(profile)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
