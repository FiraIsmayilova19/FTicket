import qrcode
from pathlib import Path

QR_DIR = Path("data/qrcodes")
QR_DIR.mkdir(parents=True, exist_ok=True)

def generate_qr_for_ticket(ticket_id: int, data: str) -> str:
    filepath = QR_DIR / f"ticket_{ticket_id}.png"
    img = qrcode.make(data)
    img.save(str(filepath))
    return str(filepath)
