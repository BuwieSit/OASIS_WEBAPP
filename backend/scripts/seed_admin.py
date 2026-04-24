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
        # Admin 1 Data
        id1, pass1 = "admin001", "AdminPass123!"
        # Admin 2 Data
        id2, pass2 = "admin@oasis.com", "adm1nOaSiS@!"

        # 1. Check if they already exist to avoid Unique Constraint errors
        exists1 = db.session.query(User).filter(User.email == id1).first()
        exists2 = db.session.query(User).filter(User.email == id2).first()

        if not exists1:
            admin1 = User(
                email=id1,  # Keep the original attribute name
                password_hash=hash_password(pass1),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.session.add(admin1)
            print(f"Created: {id1}")

        if not exists2:
            admin2 = User(
                email=id2,  # Use 'email', NOT 'email_two'
                password_hash=hash_password(pass2), # Use 'password_hash'
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.session.add(admin2)
            print(f"Created: {id2}")

        db.session.commit()
        print("Seeding complete.")
        
        
# def run():
#     """
#     Creates admin user:
#       identifier: admin001
#       password:   AdminPass123!
#     Stored in users.email column.
#     """
#     app = create_app()
#     with app.app_context():
#         identifier = "admin001"
#         password = "AdminPass123!"

#         identifier_two = "admin@oasis.com"
#         password_two = "adm1nOaSiS@!"
        
#         existing = db.session.query(User).filter(User.email == identifier).first()
#         if existing:
#             print(f"Admin '{identifier}' already exists.")
#             return

#         admin = User(
#             email=identifier,
#             password_hash=hash_password(password),
#             role=UserRole.ADMIN,
#             is_active=True,
#             is_verified=True,
#         )
        
#         admin_two = User(
#             email_two=identifier_two,
#             password_two_hash=hash_password(password_two),
#             role=UserRole.ADMIN,
#             is_active_two=True,
#             is_verified_two=True,
#         )
        
#         db.session.add(admin)
#         db.session.add(admin_two)
#         db.session.commit()

#         print("Seeded admin:")
#         print(f"  identifier: {identifier}")
#         print(f"  password:   {password}")
#         print(f" admin2: {identifier_two}")
#         print(f" password2 : {password_two}")

if __name__ == "__main__":
    run()
