from app.extensions import db

class HTEContactPerson(db.Model):
    __tablename__ = "hte_contact_persons"

    id = db.Column(db.Integer, primary_key=True)
    hte_prospect_id = db.Column(
        db.Integer,
        db.ForeignKey("hte_prospects.id"),
        nullable=False
    )

    name = db.Column(db.String(150), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    contact_number = db.Column(db.String(50), nullable=False)
