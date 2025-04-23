'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast'; // Optional for notifications
import { useSelector, useDispatch } from 'react-redux';
import {
  updateField,
  resetForm,
  submitOnboardingForm,
  selectOnboardingData,
  selectOnboardingStatus,
  selectOnboardingError,
} from '@/store/slices/onboardingSlice';
import { useEffect } from 'react';
import { AppDispatch } from '@/store/store';


const formSchema = z.object({
  firstName: z.string().min(1, {
    message: 'First name is required.',
  }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, {
    message: 'Last name is required.',
  }),
  preferredName: z.string().optional(),

//   //address
  address: z.object({
    addressOne: z.string().min(1, {
    message: 'Address line 1 is required.',
  }),
})
  
//   streetName: z.string().min(1, {
//     message: 'Street name is required.',
//   }),
//   city: z.string().min(1, {
//     message: 'City is required.',
//   }),
//   state: z.string().min(1, {
//     message: 'State is required.',
//   }),
//   zipCode: z.string().min(5, {
//     message: 'Valid ZIP code is required.',
//   }),

//   // Contact Information
//   cellPhone: z.string().regex(/^\d{10}$/, {
//     message: 'Please enter a valid 10-digit phone number.',
//   }),
//   workPhone: z.string().regex(/^\d{10}$/, {
//     message: 'Please enter a valid 10-digit phone number.',
//   }).optional(),
//   email: z.string().email({
//     message: 'Please enter a valid email address.',
//   }),

//   // identification
//   ssn: z.string().regex(/^\d{9}$/, {
//     message: 'Please enter a valid 9-digit SSN.',
//   }),
//   dateOfBirth: z.date({
//     required_error: "Date of birth is required.",
//   }),
//   gender: z.enum(['male', 'female', 'prefer_not_to_say'], {
//     required_error: "Please select a gender option.",
//   }),
});

export default function OnboardingForm() {
    const dispatch = useDispatch<AppDispatch>();
    const formData = useSelector(selectOnboardingData);
    const status = useSelector(selectOnboardingStatus);
    const error = useSelector(selectOnboardingError);
  // Initialize the form with default values and the zodResolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        firstName: '',
        middleName: '',
        lastName: '',
        preferredName: '',
        address: {
            addressOne: '',
        },
        // streetName: '',
        // city: '',
        // state: '',
        // zipCode: '',
        // cellPhone: '',
        // workPhone: '',
        // email: 'user@example.com', // Pre-filled example
        // ssn: '',
        // gender: 'prefer_not_to_say',
    },
  });



  function onSubmit(values: z.infer<typeof formSchema>) {
    // Only dispatch to Redux when the form is submitted
    dispatch(submitOnboardingForm(values));

  }

  // Show toast notifications based on submission status
  useEffect(() => {
    if (status === 'succeeded') {
      toast.success('Form submitted successfully!');
      // Reset the form after successful submission
      form.reset();
      dispatch(resetForm());
    } else if (status === 'failed' && error) {
      toast.error(error);
    }
  }, [status, error, form, dispatch]);


  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Onboarding Form</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> 
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex">
                    First Name <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex">
                    Middle Name <span className="text-red-500 ml-1"></span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex">
                    Last Name <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex">
                    Preferred Name <span className="text-red-500 ml-1"></span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
                control={form.control}
                name="address.addressOne"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex">
                        Address line 1 <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
          </div>

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}