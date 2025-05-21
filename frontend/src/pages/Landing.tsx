import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDays,
  Users,
  Wallet,
  CheckSquare,
  StarIcon,
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  Heart
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Landing = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-700 opacity-90">
          <img 
            src="https://images.pexels.com/photos/7180617/pexels-photo-7180617.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Event background" 
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your Perfect Event <br />
                <span className="text-accent-400">Just a Click Away</span>
              </h1>
              <p className="mt-6 text-xl text-white max-w-3xl">
                VenuVibe simplifies event planning with all the tools you need in one place.
                Create stunning events, manage your guests, and stay on budget effortlessly.
              </p>
              <div className="mt-10">
                <Link to="/register">
                  <Button size="lg" className="mr-4">
                    Get Started
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="lg" className="bg-white">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Event planning" 
                  className="w-full h-64 object-cover sm:h-72 md:h-80 lg:h-96"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 sm:py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">All-in-One Platform</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Plan your event with ease
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Everything you need to create unforgettable events, all in one place.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-card">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                        <CalendarDays className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Event Dashboard</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Manage all your events in one place with a comprehensive dashboard for tracking progress.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-card">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-secondary-600 rounded-md shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Guest Management</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Invite guests, track RSVPs, and manage seating arrangements all in one intuitive interface.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-card">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-accent-500 rounded-md shadow-lg">
                        <Wallet className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Budget Tracker</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Keep your event on budget with visual tracking, expense categorization, and payment status.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-card">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-success-600 rounded-md shadow-lg">
                        <CheckSquare className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Task Management</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Stay organized with task lists, deadlines, and notifications to keep your planning on track.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Testimonials</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Loved by event planners
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-xl shadow-card p-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <img
                      className="h-12 w-12 rounded-full"
                      src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Sarah Johnson"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Sarah Johnson</h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-4 w-4 fill-current text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-700">
                  "VenuVibe made planning my wedding so much easier! The budget tracker
                  helped me stay on target and the guest management feature was a lifesaver
                  for tracking RSVPs."
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl shadow-card p-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <img
                      className="h-12 w-12 rounded-full"
                      src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Michael Chen"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Michael Chen</h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-4 w-4 fill-current text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-700">
                  "As a corporate event planner, I need to stay organized across multiple events.
                  VenuVibe's dashboard gives me a clear overview of all my projects in one place."
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl shadow-card p-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <img
                      className="h-12 w-12 rounded-full"
                      src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Jessica Martinez"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Jessica Martinez</h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-4 w-4 fill-current text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-700">
                  "I planned my daughter's sweet sixteen with VenuVibe and it was a breeze!
                  The vendor directory helped me find the perfect DJ and photographer."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">How It Works</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Simple steps to perfect events
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
                  <Calendar className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Create Your Event</h3>
                <p className="mt-2 text-base text-gray-500">
                  Choose from our templates or start from scratch to create your perfect event.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Customize & Plan</h3>
                <p className="mt-2 text-base text-gray-500">
                  Add vendors, guests, and budget details. Manage tasks with our easy planning tools.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Enjoy Your Event</h3>
                <p className="mt-2 text-base text-gray-500">
                  Relax and enjoy your perfectly planned event while we handle the organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 lg:py-16">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to create your next amazing event?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-primary-100">
                Join thousands of event planners who are creating unforgettable experiences with VenuVibe.
                Sign up today and get started with our free plan.
              </p>
              <div className="mt-8">
                <div className="inline-flex rounded-md shadow">
                  <Link to="/register">
                    <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-50">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <img
                  className="w-full h-64 object-cover sm:h-72 md:h-80 lg:h-96"
                  src="https://images.pexels.com/photos/3243027/pexels-photo-3243027.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Event planning dashboard"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};