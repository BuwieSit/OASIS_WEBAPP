import os
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db 
from app.models.user import User, UserRole
from app.utils.security import hash_password

def run():
    app = create_app()
    with app.app_context():
        admins = [
            ("admin@oasis.com", "adm1nOaSiS@!"),
            ("ishie@oasis.com", "IshiePass123!"),
            ("josiah@oasis.com", "JosiahPass123!"),
            ("francine@oasis.com", "FrancinePass123!"),
            ("vincent@oasis.com", "VincentPass123!"),
            ("buwie@oasis.com", "BuwiePass123!")
        ]

        for email, password in admins:
            exists = db.session.query(User).filter(User.email == email).first()
            if not exists:
                new_user = User(
                    email=email,
                    password_hash=hash_password(password),
                    role=UserRole.ADMIN,
                    is_active=True,
                    is_verified=True
                )
                db.session.add(new_user)
                print(f"Created: {email}")
        
        db.session.commit()

if __name__ == "__main__":
    run()
