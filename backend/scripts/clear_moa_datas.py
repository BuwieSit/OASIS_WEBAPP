import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db
from app.models import (
    HostTrainingEstablishment,
    MemorandumOfAgreement,
    MoaProspect,
    User,
    UserRole
)

app = create_app()

with app.app_context():
    deleted_moa_prospects = MoaProspect.query.delete()
    deleted_moas = MemorandumOfAgreement.query.delete()
    deleted_htes = HostTrainingEstablishment.query.delete()
    deleted_students = User.query.filter(
        User.role == UserRole.STUDENT
    ).delete(synchronize_session=False)
    db.session.commit()

    print(f"✅ Deleted STUDENT Users: {deleted_students}")
    print(f"✅ Deleted MOA Prospects: {deleted_moa_prospects}")
    print(f"✅ Deleted MOAs: {deleted_moas}")
    print(f"✅ Deleted HTEs: {deleted_htes}")
    
    