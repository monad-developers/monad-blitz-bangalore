
import React, { useState } from 'react';
import { AlertTriangle, FileText, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrowId: number;
}

const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose, escrowId }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    reason: '',
    evidence: '',
    description: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for the dispute.",
        variant: "destructive"
      });
      return;
    }

    // Mock dispute creation
    console.log('Creating dispute for escrow', escrowId, 'with data:', formData);
    
    toast({
      title: "Dispute Raised Successfully!",
      description: "A private Telegram group has been created for mediation. You'll receive an invite shortly.",
    });

    // Reset form and close modal
    setFormData({
      reason: '',
      evidence: '',
      description: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Raise Dispute - Escrow #{escrowId}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dispute Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium text-gray-300">
              <FileText className="w-4 h-4 inline mr-2" />
              Reason for Dispute *
            </Label>
            <Input
              id="reason"
              placeholder="e.g., Work not delivered as agreed"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Evidence Links */}
          <div className="space-y-2">
            <Label htmlFor="evidence" className="text-sm font-medium text-gray-300">
              Evidence Links (Optional)
            </Label>
            <Input
              id="evidence"
              placeholder="https://example.com/evidence or file URLs"
              value={formData.evidence}
              onChange={(e) => handleInputChange('evidence', e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-400">
              Provide links to screenshots, documents, or other evidence
            </p>
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              Detailed Description
            </Label>
            <Textarea
              id="description"
              placeholder="Explain the situation in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 min-h-[100px]"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-300 mb-1">What happens next?</h4>
                <p className="text-sm text-gray-300">
                  A private Telegram group will be created with you, the other party, and our neutral arbitrator. 
                  The mediator will review all evidence and make a fair decision within 48 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Raise Dispute
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeModal;
