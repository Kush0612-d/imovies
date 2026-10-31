import QRCode from 'qrcode';

export const generateTicketQR = async (ticketData) => {
  try {
    const payload = JSON.stringify({
      bookingId: ticketData.bookingId,
      movie: ticketData.movieTitle,
      cinema: ticketData.cinemaName,
      showDate: ticketData.showDate,
      startTime: ticketData.startTime,
      seats: ticketData.seats,
      code: ticketData.secureVerificationCode,
      verifiedUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-ticket/${ticketData.bookingId}`
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF'
      },
      width: 250
    });

    return qrDataUrl;
  } catch (error) {
    console.error('[QR Error]', error.message);
    return '';
  }
};

