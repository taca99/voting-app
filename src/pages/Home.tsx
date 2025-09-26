import AiSuggest from "../components/AiSuggest";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Users, Zap, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              Decentralized Voting
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-foreground">
              
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Secure, transparent, and tamper-proof voting powered by blockchain technology. 
              Make your voice heard in the future of governance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 border-0 text-lg px-8 py-4">
                  Start Voting
                </Button>
              </Link>
              <Link to="/results">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4"
                >
                  View Results
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-accent opacity-30 -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background-secondary/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Choose VoteDAO?
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure & Immutable",
                description: "Every vote is cryptographically secured and permanently recorded on the blockchain."
              },
              {
                icon: Users,
                title: "Community Driven",
                description: "Participate in decentralized governance and shape the future together."
              },
              {
                icon: Zap,
                title: "Real-time Results",
                description: "Watch voting results update in real-time with complete transparency."
              },
              {
                icon: Globe,
                title: "Global Access",
                description: "Vote from anywhere in the world with just your Web3 wallet."
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 card-glow bg-card border-border">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-card-foreground">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { number: "10,247", label: "Total Votes Cast" },
              { number: "156", label: "Active Proposals" },
              { number: "2,341", label: "Community Members" }
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold gradient-text">
                  {stat.number}
                </div>
                <div className="text-muted-foreground text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Suggest Section (UBAČENO) */}
      <section className="py-20 px-4 bg-background-secondary/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-8 text-foreground">
            AI Voting Proposal
          </h3>
          <div className="flex justify-center">
            <AiSuggest />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
