import { Gift, Heart, Clock, Shield } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: <Gift className="w-12 h-12 text-pink-500" />,
      title: "Thoughtful Curated Gifts",
      description: "Carefully selected gifts for every occasion that are sure to delight."
    },
    {
      icon: <Heart className="w-12 h-12 text-pink-500" />,
      title: "100% Anonymous",
      description: "Your identity remains completely hidden. We'll never reveal who sent the gift."
    },
    {
      icon: <Clock className="w-12 h-12 text-pink-500" />,
      title: "60-Second Gifting",
      description: "Our streamlined process lets you send a gift in just one minute."
    },
    {
      icon: <Shield className="w-12 h-12 text-pink-500" />,
      title: "Secure & Reliable",
      description: "We use industry-leading security to protect your information."
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose Anonymous Angel?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 text-center">
              <div className="mx-auto flex items-center justify-center bg-pink-50 w-20 h-20 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}