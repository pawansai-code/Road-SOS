from apps.sos.models import Incident


def trigger_sos(data):

    latitude = data["latitude"]

    longitude = data["longitude"]

    service_type = data["service_type"]

    # Generate Google Maps link
    map_link = (
        f"https://maps.google.com/?q="
        f"{latitude},{longitude}"
    )

    # Save to PostgreSQL
    incident = Incident.objects.create(

        latitude=latitude,

        longitude=longitude,

        service_type=service_type,

        map_link=map_link
    )

    return {

        "message": "SOS Triggered Successfully",

        "map_link": map_link,

        "incident_id": incident.id
    }