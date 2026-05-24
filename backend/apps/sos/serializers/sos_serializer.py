from rest_framework import serializers


class SOSSerializer(serializers.Serializer):

    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    service_type = serializers.ChoiceField(
    choices=[
        "POLICE",
        "FIRE",
        "MEDICAL",
        "DISASTER",
        "WOMAN",
        "CHILD",
        "ELDERLY",
        "RAILWAY",
        "BOTH"
    ]
)