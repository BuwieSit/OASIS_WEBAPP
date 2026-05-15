import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db
from app.models import User, UserRole, MoaProspect

app = create_app()

with app.app_context():

    # Get admin IDs
    admin_ids = [
        user.id
        for user in User.query.filter(
            User.role == UserRole.ADMIN
        ).all()
    ]

    MoaProspect.query.filter(
        MoaProspect.reviewed_by.in_(admin_ids)
    ).update(
        {MoaProspect.reviewed_by: None},
        synchronize_session=False
    )

    deleted_admin = User.query.filter(
        User.role == UserRole.ADMIN
    ).delete(synchronize_session=False)

    db.session.commit()

    print(f"✅ Deleted ADMIN Users: {deleted_admin}")