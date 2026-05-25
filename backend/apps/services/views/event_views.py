from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..serializers.event_serializer import SOSEventLogSerializer

class SOSEventLogView(APIView):
    def get_firebase_uid(self, request):
        return request.headers.get('X-Firebase-Uid', 'dummy_user_123')

    def post(self, request):
        uid = self.get_firebase_uid(request)
        serializer = SOSEventLogSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(user_id=uid)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        uid = self.get_firebase_uid(request)
        logs = SOSEventLog.objects.filter(user_id=uid)
        serializer = SOSEventLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
