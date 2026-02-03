from datetime import date
from app.extensions import db
from app.models import HostTrainingEstablishment


def sync_moa_statuses():
    today = date.today()

    expired_htes = (
        HostTrainingEstablishment.query
        .filter(
            HostTrainingEstablishment.moa_expiry_date.isnot(None),
            HostTrainingEstablishment.moa_expiry_date < today,
            HostTrainingEstablishment.moa_status != "EXPIRED"
        )
        .all()
    )

    if not expired_htes:
        return

    for hte in expired_htes:
        hte.moa_status = "EXPIRED"

    db.session.commit()
