
import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ShareApprovalLinkProps {
  escrowId: number;
  freelancerTelegram: string;
  description: string;
}

const ShareApprovalLink: React.FC<ShareApprovalLinkProps> = ({ 
  escrowId, 
  freelancerTelegram, 
  description 
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Generate the approval link (in a real app, this would be a proper route)
  const approvalLink = `${window.location.origin}/approve/${escrowId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(approvalLink);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Approval link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShareToTelegram = () => {
    const message = `Hi ${freelancerTelegram}! Please review and approve the work for: "${description}". Use this link: ${approvalLink}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(approvalLink)}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share Approval Link
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Approval Link
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-300 text-sm mb-2">
              Share this link with {freelancerTelegram} to approve the project:
            </p>
            <p className="text-gray-400 text-xs italic">"{description}"</p>
          </div>

          <div className="flex gap-2">
            <Input
              value={approvalLink}
              readOnly
              className="bg-slate-800 border-slate-600 text-white flex-1"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleShareToTelegram}
              className="bg-blue-600 hover:bg-blue-700 flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Share via Telegram
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Close
            </Button>
          </div>

          <div className="text-xs text-gray-400 border-t border-slate-700 pt-4">
            <p>💡 Tip: The freelancer can use this link to review project details and submit their approval or feedback.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareApprovalLink;
