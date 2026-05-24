from ..models.user_profile import UserProfile

class UserRepository:
    @staticmethod
    def get_by_firebase_uid(firebase_uid: str) -> UserProfile | None:
        try:
            return UserProfile.objects.get(firebase_uid=firebase_uid)
        except UserProfile.DoesNotExist:
            return None

    @staticmethod
    def create(data: dict) -> UserProfile:
        return UserProfile.objects.create(**data)

    @staticmethod
    def update(profile: UserProfile, data: dict) -> UserProfile:
        for key, value in data.items():
            setattr(profile, key, value)
        profile.save()
        return profile
