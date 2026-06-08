
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Phone, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { sendFormEmail } from '@/utils/emailService';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'consultation' | 'care-needs';
}

const ContactModal = ({ isOpen, onClose, type = 'consultation' }: ContactModalProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clientFullName: '',
    clientDOB: '',
    clientAge: '',
    phone: '',
    email: '',
    county: '',
    city: '',
    primaryContactName: '',
    primaryContactPhone: '',
    primaryContactEmail: '',
    diagnosis: '',
    careType: [],
    urgency: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  // Update age when DOB changes
  useEffect(() => {
    if (formData.clientDOB) {
      const calculatedAge = calculateAge(formData.clientDOB);
      setFormData(prev => ({ ...prev, clientAge: calculatedAge }));
    }
  }, [formData.clientDOB]);

  const counties = [
    'Cobb', 'Paulding', 'Cherokee', 'Fulton', 'Douglas', 
    'Gwinnett', 'Polk', 'Bartow'
  ];

  const careTypes = [
    'Personal Care', 'Companionship', 'Meal Preparation', 
    'Light Housekeeping', 'Transportation', 'Medication Supervision',
    'Skilled Nursing', 'Around-The-Clock Care'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientFullName || !formData.phone || !formData.county) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submissionData = {
        ...formData,
        date: new Date().toLocaleString()
      };
      await sendFormEmail(submissionData, 'contact');
      toast.success('Thank you! Our care team will contact you within 24 hours.');
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        clientFullName: '',
        clientDOB: '',
        clientAge: '',
        phone: '',
        email: '',
        county: '',
        city: '',
        primaryContactName: '',
        primaryContactPhone: '',
        primaryContactEmail: '',
        diagnosis: '',
        careType: [],
        urgency: '',
        message: '',
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('There was an issue sending your request. Please try calling us directly at 1-866-756-7374.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCareTypeChange = (careType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      careType: checked 
        ? [...prev.careType, careType]
        : prev.careType.filter(type => type !== careType)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[950px] max-h-[95vh] overflow-y-auto border-t-8 border-healthcare-gold shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-healthcare-green font-serif font-bold">
            {type === 'consultation' ? 'Free Consultation Request' : 'Care Needs Assessment'}
          </DialogTitle>
          <DialogDescription>
            Please fill out the form below and we will get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-healthcare-green/5 p-3 md:p-4 rounded-lg mb-4 md:mb-6 border-l-4 border-healthcare-gold">
          <div className="flex items-center space-x-2 text-healthcare-green">
            <Clock size={18} className="md:hidden" />
            <Clock size={20} className="hidden md:block text-healthcare-gold" />
            <span className="font-serif font-medium text-sm md:text-base">Our care team will contact you within 24 hours</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" name="contact" data-netlify="true">
          <input type="hidden" name="form-name" value="contact" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label htmlFor="clientFullName" className="text-sm md:text-base font-semibold text-healthcare-green">Client's Full Name *</Label>
              <Input
                id="clientFullName"
                value={formData.clientFullName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientFullName: e.target.value }))}
                className="h-10 md:h-11 border-healthcare-green/20 focus:border-healthcare-gold"
                placeholder="First and Last Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientDOB" className="text-sm md:text-base font-semibold text-healthcare-green">Date of Birth</Label>
              <Input
                id="clientDOB"
                type="date"
                value={formData.clientDOB}
                onChange={(e) => setFormData(prev => ({ ...prev, clientDOB: e.target.value }))}
                className="h-10 md:h-11 border-healthcare-green/20 focus:border-healthcare-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAge" className="text-sm md:text-base font-semibold text-healthcare-green">Age</Label>
              <Input
                id="clientAge"
                value={formData.clientAge}
                disabled
                className="h-10 md:h-11 bg-healthcare-green/5 border-healthcare-green/10"
                placeholder="Calculated"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm md:text-base font-semibold text-healthcare-green">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                className="h-10 md:h-11 border-healthcare-green/20 focus:border-healthcare-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm md:text-base font-semibold text-healthcare-green">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-10 md:h-11 border-healthcare-green/20 focus:border-healthcare-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="county" className="text-sm md:text-base font-semibold text-healthcare-green">County *</Label>
              <Select value={formData.county} onValueChange={(value) => setFormData(prev => ({ ...prev, county: value }))}>
                <SelectTrigger className="h-10 md:h-11 border-healthcare-green/20">
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((county) => (
                    <SelectItem key={county} value={county.toLowerCase()}>
                      {county} County
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm md:text-base font-semibold text-healthcare-green">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="h-10 md:h-11 border-healthcare-green/20 focus:border-healthcare-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="primaryContactName" className="text-sm md:text-base font-semibold text-healthcare-green">Primary Contact Name</Label>
              <Input
                id="primaryContactName"
                value={formData.primaryContactName}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryContactName: e.target.value }))}
                className="h-10 md:h-11 border-healthcare-green/20 focus:border-healthcare-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryContactPhone" className="text-sm md:text-base font-semibold text-healthcare-green">Primary Contact Phone</Label>
              <Input
                id="primaryContactPhone"
                type="tel"
                value={formData.primaryContactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryContactPhone: e.target.value }))}
                className="h-10 md:h-11 border-healthcare-green/20 focus:border-healthcare-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryContactEmail" className="text-sm md:text-base font-semibold text-healthcare-green">Primary Contact Email</Label>
              <Input
                id="primaryContactEmail"
                type="email"
                value={formData.primaryContactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryContactEmail: e.target.value }))}
                className="h-10 md:h-11 border-healthcare-green/20 focus:border-healthcare-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="text-sm md:text-base font-semibold text-healthcare-green">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Please describe medical conditions..."
                className="min-h-[100px] border-healthcare-green/20 focus:border-healthcare-gold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base font-semibold text-healthcare-green">Care Services Needed</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {careTypes.map((careType) => (
                  <div key={careType} className="flex items-center space-x-2">
                    <Checkbox
                      id={careType}
                      checked={formData.careType.includes(careType)}
                      onCheckedChange={(checked) => handleCareTypeChange(careType, checked as boolean)}
                    />
                    <Label htmlFor={careType} className="text-[10px] md:text-xs font-medium cursor-pointer">{careType}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2 lg:col-span-1">
              <Label htmlFor="urgency" className="text-sm md:text-base font-semibold text-healthcare-green">Urgency</Label>
              <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                <SelectTrigger className="h-10 md:h-11 border-healthcare-green/20">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediately</SelectItem>
                  <SelectItem value="week">Within a week</SelectItem>
                  <SelectItem value="month">Within a month</SelectItem>
                  <SelectItem value="planning">Just planning ahead</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="message" className="text-sm md:text-base font-semibold text-healthcare-green">Additional Information</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Specific care needs, concerns, or questions..."
                className="min-h-[100px] border-healthcare-green/20 focus:border-healthcare-gold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 md:gap-4">
            <Button 
              type="submit" 
              className="btn-healthcare h-11 md:h-12 text-sm md:text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Submit Request'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.open('tel:1-866-756-7374')}
              className="flex items-center justify-center space-x-2 h-11 md:h-12 text-sm md:text-base border-healthcare-green text-healthcare-green hover:bg-healthcare-green hover:text-white transition-all"
            >
              <Phone size={16} />
              <span>Call Now: 1-866-756-7374</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
