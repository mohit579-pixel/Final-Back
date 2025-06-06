import puppeteer from 'puppeteer';
import Appointment from '../models/appointment.models.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.models.js';
import generatePrescriptionHTML from '../utils/prescriptionTemplate.js';
import { validateObjectId } from '../utils/validation.js';

export const generatePrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId || !validateObjectId(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const doctor = await Doctor.findById(appointment.doctorId);
    const patient = await Patient.findOne({ userId: appointment.patientId });

    if (!doctor || !patient) {
      return res.status(400).json({ success: false, message: 'Doctor or patient not found' });
    }

    const prescriptionData = {
      doctor: {
        fullName: doctor.name,
        licenseNumber: 'ABC1234',
        speciality: doctor.speciality
      },
      patient: {
        fullName: patient.fullName,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone
      },
      appointment: {
        ...appointment.toObject(),
        prescription: appointment.prescriptionText
      }
    };

    const html = generatePrescriptionHTML(prescriptionData);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${appointmentId}.pdf`);
    res.end(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to generate PDF', error: err.message });
  }
};
