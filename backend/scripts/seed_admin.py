import os
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db 
from app.models.user import User, UserRole
from app.utils.security import hash_password

def run():
    """
    Creates admin user:
      identifier: admin001
      password:   AdminPass123!
    Stored in users.email column.
    """
    app = create_app()
    with app.app_context():
        identifier = "admin001"
        password = "AdminPass123!"

        existing = db.session.query(User).filter(User.email == identifier).first()
        if existing:
            print(f"Admin '{identifier}' already exists.")
            return

        admin = User(
            email=identifier,
            password_hash=hash_password(password),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.session.add(admin)
        db.session.commit()
        print("Seeded admin:")
        print(f"  identifier: {identifier}")
        print(f"  password:   {password}")

if __name__ == "__main__":
    run()
