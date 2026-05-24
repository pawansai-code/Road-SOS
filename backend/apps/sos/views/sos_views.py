# Import DRF APIView
from rest_framework.views import APIView

# Used to send API responses
from rest_framework.response import Response

# HTTP status codes
from rest_framework import status

# Import serializer
from apps.sos.serializers.sos_serializer import SOSSerializer

# Import service layer
from apps.sos.services.incident_service import trigger_sos


# API View for handling SOS requests
class SOSView(APIView):

    # Handles POST requests
    def post(self, request):

        print("===== SOS API HIT =====")

        print("REQUEST DATA:")
        print(request.data)

        # Validate incoming request data
        serializer = SOSSerializer(data=request.data)

        # Check whether data is valid
        if serializer.is_valid():

            print("===== VALID DATA =====")

            print(serializer.validated_data)

            # Call service layer with validated data
            response_data = trigger_sos(serializer.validated_data)

            print("===== SERVICE RESPONSE =====")

            print(response_data)

            # Return success response
            return Response(
                response_data,
                status=status.HTTP_200_OK
            )

        print("===== SERIALIZER ERRORS =====")

        print(serializer.errors)

        # Return validation errors if request is invalid
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
