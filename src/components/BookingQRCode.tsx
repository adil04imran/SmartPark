import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BookingQRCodeProps {
  bookingId: string;
  bookingData: {
    locationName: string;
    slotNumber: string;
    startTime: string;
    endTime: string;
    vehicleNumber: string;
  };
}

export const BookingQRCode: React.FC<BookingQRCodeProps> = ({ bookingId, bookingData }) => {
  // Convert booking data to a string for the QR code
  const qrValue = JSON.stringify({
    bookingId,
    ...bookingData,
    timestamp: new Date().toISOString()
  });

  // Function to download QR code as PNG
  const downloadQRCode = () => {
    try {
      const svgElement = document.querySelector('#qr-code svg') as SVGSVGElement;
      if (!svgElement) {
        console.error('SVG element not found');
        return;
      }
      
      // Get the SVG as a string
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Set canvas size to match the SVG
      canvas.width = 300;  // Fixed size for better quality
      canvas.height = 300; // Fixed size for better quality
      
      img.onload = () => {
        if (!ctx) return;
        
        // Clear and draw on canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Create download link
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `booking-${bookingId}.png`;
        downloadLink.href = pngFile;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      
      // Set up error handling for the image
      img.onerror = () => {
        console.error('Error loading the image for download');
      };
      
      // Set the image source to the SVG data
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      
    } catch (error) {
      console.error('Error generating QR code image:', error);
    }
  };

  // Format time as HH:MM AM/PM
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    
    // If time is already in HH:MM format, format it nicely
    if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    
    // Fallback for other date formats
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr; // Return original if invalid date
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Your Booking QR Code</h3>
      <div id="qr-code" className="p-4 bg-white rounded border border-gray-200 mb-4">
        <QRCodeSVG
          value={qrValue}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      <div className="text-center mb-4">
        <p className="font-medium">{bookingData.locationName}</p>
        <p className="text-sm text-gray-600">Slot: {bookingData.slotNumber}</p>
        <p className="text-sm text-gray-600">
          {formatTime(bookingData.startTime)} - {formatTime(bookingData.endTime)}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadQRCode}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Save QR Code
      </Button>
    </div>
  );
};

export default BookingQRCode;
