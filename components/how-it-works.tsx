export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Choose a Gift",
      description: "Browse our curated selection of gifts and pick the perfect one."
    },
    {
      number: "02",
      title: "Add a Message",
      description: "Optionally include a heartfelt message to accompany your gift."
    },
    {
      number: "03",
      title: "Enter Shipping Details",
      description: "Tell us where to send the gift. Don't worry, your information stays private."
    },
    {
      number: "04",
      title: "Confirm & Send",
      description: "Review your gift and message, then send it on its way with just a click."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gradient-to-b from-rose-50 to-white">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">How It Works</h2>
          <p className="text-lg text-gray-600">
            We've made sending anonymous gifts as simple as possible. Follow these four easy steps:
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-pink-200 transform -translate-x-1/2"></div>
          
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`lg:flex items-center ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                  {/* Circle indicator on the line */}
                  <div className="hidden lg:flex absolute left-1/2 w-10 h-10 bg-pink-500 rounded-full items-center justify-center transform -translate-x-1/2 text-white font-bold">
                    {step.number.split('')[1]}
                  </div>
                  
                  <div className="lg:w-1/2 p-6 mx-4 my-4 bg-white rounded-xl shadow-sm border border-gray-100 lg:mx-8">
                    <div className="flex items-center mb-4">
                      <div className="flex lg:hidden items-center justify-center bg-pink-500 w-10 h-10 rounded-full mr-4 text-white font-bold">
                        {step.number.split('')[1]}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  
                  <div className="lg:w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}