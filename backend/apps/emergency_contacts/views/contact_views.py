from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models.contact import EmergencyContact
from ..serializers.contact_serializer import EmergencyContactSerializer
from apps.users.models.user_profile import UserProfile

class EmergencyContactView(APIView):
    def get_user(self, request):
        firebase_uid = request.headers.get('X-Firebase-Uid', 'dummy_user_123')
        return get_object_or_404(UserProfile, firebase_uid=firebase_uid)

    def get(self, request):
        user = self.get_user(request)
        contacts = EmergencyContact.objects.filter(user=user).order_by('created_at')
        serializer = EmergencyContactSerializer(contacts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = self.get_user(request)
        
        # Enforce max 5 contacts limit
        if EmergencyContact.objects.filter(user=user).count() >= 5:
            return Response(
                {"error": "You can only save up to 5 emergency contacts."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = EmergencyContactSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmergencyContactDetailView(APIView):
    def get_user(self, request):
        firebase_uid = request.headers.get('X-Firebase-Uid', 'dummy_user_123')
        return get_object_or_404(UserProfile, firebase_uid=firebase_uid)

    def delete(self, request, pk):
        user = self.get_user(request)
        contact = get_object_or_404(EmergencyContact, pk=pk, user=user)
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
