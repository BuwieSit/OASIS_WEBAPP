# from app import create_app

# app = create_app()

# if __name__ == "__main__":
#     # For local dev only
#     app.run(host="127.0.0.1", port=5001, debug=True)


# DEPLOYMENT VERSION
import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)