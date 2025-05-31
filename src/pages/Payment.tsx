import React, { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WalletButton } from "@/components/WalletButton";
import { useWallet } from "@/hooks/useWallet";

// Add Monad logo SVG component
const MonadLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-1"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M200 400C310.457 400 400 310.457 400 200C400 89.5431 310.457 0 200 0C89.5431 0 0 89.5431 0 200C0 310.457 89.5431 400 200 400ZM200 360C288.366 360 360 288.366 360 200C360 111.634 288.366 40 200 40C111.634 40 40 111.634 40 200C40 288.366 111.634 360 200 360Z"
      fill="currentColor"
    />
  </svg>
);

const Payment = () => {
  const { id } = useParams();
  const location = useLocation();
  const { isConnected } = useWallet();
  const [paymentStep, setPaymentStep] = useState(1);
  const gig = location.state?.gig;

  const [formData, setFormData] = useState({
    deadline: "7",
    telegram: "",
    requirements: "",
  });

  if (!gig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 p-6">
          <CardContent>
            <h2 className="text-2xl font-bold text-white mb-4">
              Invalid Payment Request
            </h2>
            <p className="text-gray-300 mb-6">
              Please select a gig before proceeding to payment.
            </p>
            <Link to="/gigs">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Browse Gigs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 p-6">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-300 mb-6">
              Please connect your wallet to proceed with the payment.
            </p>
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep(2);
  };

  const handleConfirmPayment = async () => {
    // Here you would integrate with your smart contract
    setPaymentStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  GriffinLock.mon
                </h1>
              </Link>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to={`/gigs/${id}`}
            className="text-white/80 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gig
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-2xl">
                  {paymentStep === 1
                    ? "Project Details"
                    : paymentStep === 2
                    ? "Confirm Payment"
                    : "Payment Complete"}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {paymentStep === 1
                    ? "Set up your project requirements"
                    : paymentStep === 2
                    ? "Review and confirm your payment"
                    : "Your payment has been processed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentStep === 1 ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Project Deadline
                      </label>
                      <Select
                        value={formData.deadline}
                        onValueChange={(value) =>
                          setFormData({ ...formData, deadline: value })
                        }
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select deadline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Your Telegram Handle
                      </label>
                      <Input
                        placeholder="@username"
                        value={formData.telegram}
                        onChange={(e) =>
                          setFormData({ ...formData, telegram: e.target.value })
                        }
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Project Requirements
                      </label>
                      <Textarea
                        placeholder="Describe your project requirements in detail..."
                        value={formData.requirements}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requirements: e.target.value,
                          })
                        }
                        className="bg-white/5 border-white/10 text-white h-32"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Continue to Payment
                    </Button>
                  </form>
                ) : paymentStep === 2 ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-gray-300">Service Fee</span>
                        <span className="text-white flex items-center">
                          <MonadLogo />
                          {gig.price} MON
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-gray-300">Platform Fee</span>
                        <span className="text-white flex items-center">
                          <MonadLogo />
                          {(gig.price * 0.05).toFixed(2)} MON
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 text-lg font-semibold">
                        <span className="text-white">Total</span>
                        <span className="text-white flex items-center">
                          <MonadLogo />
                          {(gig.price * 1.05).toFixed(2)} MON
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="text-blue-400 font-medium mb-1">
                            Payment Protection
                          </h4>
                          <p className="text-blue-300 text-sm">
                            Your payment will be held in escrow until you
                            confirm the work is completed. You're protected by
                            our smart contract.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleConfirmPayment}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Confirm & Pay
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Payment Successful!
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Your payment has been processed and the freelancer has
                      been notified.
                    </p>
                    <Link to="/dashboard">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {gig.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>Delivery in {gig.deliveryTime}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <img
                        src={gig.freelancer.avatar}
                        alt={gig.freelancer.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="text-white font-medium">
                          {gig.freelancer.name}
                        </h4>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{gig.freelancer.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {paymentStep === 1 && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 text-sm">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <p className="text-gray-300">
                      Please ensure all project requirements are clearly
                      specified before proceeding to payment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
