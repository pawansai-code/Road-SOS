from ..repositories.user_repository import UserRepository
from ..models.user_profile import UserProfile

class UserService:
    @staticmethod
    def get_profile(firebase_uid: str) -> UserProfile | None:
        return UserRepository.get_by_firebase_uid(firebase_uid)

    @staticmethod
    def update_profile(firebase_uid: str, data: dict) -> UserProfile:
        profile = UserRepository.get_by_firebase_uid(firebase_uid)
        
        # We handle dummy IDs so if they don't exist, we'll create them for testing
        if not profile:
            data['firebase_uid'] = firebase_uid
            return UserRepository.create(data)
            
        return UserRepository.update(profile, data)
