import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
};

const FeatureCard = ({ icon, title, description, children }: FeatureCardProps) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-lg">
            {icon}
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {children}
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
