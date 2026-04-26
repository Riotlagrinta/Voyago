import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export class TicketPDFService {
  /**
   * Génère un ticket PDF pour une réservation
   */
  static async generateTicketPDF(booking: any): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A6', // Format carte postale, idéal pour mobile
          margin: 0
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // --- Styles & Couleurs ---
        const primaryColor = '#10B981'; // Forest Green
        const secondaryColor = '#334155'; // Slate
        const accentColor = '#F59E0B'; // Amber

        // --- En-tête ---
        doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);
        
        doc.fillColor('#FFFFFF')
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('VOYAGO', 20, 30);
        
        doc.fontSize(10)
           .font('Helvetica')
           .text('VOTRE VOYAGE COMMENCE ICI', 20, 60, { characterSpacing: 1 });

        // --- Détails de la Compagnie ---
        doc.fillColor('#FFFFFF')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(booking.schedule.route.company.name.toUpperCase(), 0, 35, {
             align: 'right',
             width: doc.page.width - 20
           });

        // --- Corps du ticket ---
        let y = 120;

        // Trajet
        doc.fillColor(secondaryColor)
           .fontSize(8)
           .font('Helvetica-Bold')
           .text('ITINÉRAIRE', 25, y);
        
        y += 15;
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(`${booking.schedule.route.departureStation.city} → ${booking.schedule.route.arrivalStation.city}`, 25, y);

        // Date & Heure
        y += 40;
        const departureDate = new Date(booking.schedule.departureTime);
        const dateStr = departureDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeStr = departureDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        doc.fontSize(8)
           .font('Helvetica-Bold')
           .text('DÉPART', 25, y);
        
        doc.text('SIÈGE', 180, y);

        y += 15;
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text(`${dateStr} à ${timeStr}`, 25, y);
        
        doc.fontSize(16)
           .text(`#${booking.seatNumber}`, 180, y - 5);

        // Passager
        y += 40;
        doc.fillColor(secondaryColor)
           .fontSize(8)
           .font('Helvetica-Bold')
           .text('PASSAGER', 25, y);

        y += 15;
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text(booking.passengerName || 'Non spécifié', 25, y);

        // --- QR Code ---
        if (booking.qrCode) {
          const qrBuffer = await QRCode.toBuffer(booking.qrCode, {
            margin: 0,
            scale: 4,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          doc.image(qrBuffer, (doc.page.width - 100) / 2, y + 40, { width: 100 });
        }

        // --- Footer ---
        doc.fontSize(7)
           .fillColor(secondaryColor)
           .font('Helvetica-Oblique')
           .text('Présentez ce ticket 30 minutes avant le départ.', 0, doc.page.height - 30, {
             align: 'center',
             width: doc.page.width
           });

        doc.rect(0, doc.page.height - 10, doc.page.width, 10).fill(primaryColor);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
