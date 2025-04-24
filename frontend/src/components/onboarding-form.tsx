import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import {
  resetForm,
  submitOnboardingForm,
  selectOnboardingData,
  selectOnboardingStatus,
  selectOnboardingError,
} from '@/store/slices/onboardingSlice';
import { useEffect, useState } from 'react';
import { AppDispatch } from '@/store/store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

enum Gender {
  Male = 'male',
  Female = 'female',
  PreferNotToSay = 'prefer_not_to_say',
}

const formSchema = z.object({
  firstName: z.string().min(1, {
    message: 'First name is required.',
  }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, {
    message: 'Last name is required.',
  }),
  preferredName: z.string().optional(),

  //profile picture
  profilePicture: z.instanceof(FileList).optional(),

  //address
  address: z.object({
    addressOne: z.string().min(1, {
      message: 'Address line 1 is required.',
    }),
    addressTwo: z.string().min(1, {
      message: 'Address line 2 is required.',
    }),
    city: z.string().min(1, {
      message: 'City is required.',
    }),
    state: z.string().min(1, {
      message: 'State is required.',
    }),
    zipCode: z.string().min(5, {
      message: 'Valid ZIP code is required.',
    }),
  }),

  // Contact Information
  cellPhone: z.string().regex(/^\d{10}$/, {
    message: 'Please enter a valid 10-digit phone number.',
  }),
  workPhone: z.string().optional(),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),

  // identification
  ssn: z.string().regex(/^\d{9}$/, {
    message: 'Please enter a valid 9-digit SSN.',
  }),
  dateOfBirth: z.string().datetime({
    message: 'Date of birth is required.',
  }),
  gender: z.nativeEnum(Gender, { message: 'Gender is required.' }),
});

const defaultAvatarUrl =
  'https://img.freepik.com/premium-vector/software-developer-vector-illustration-communication-technology-cyber-security_1249867-5464.jpg';
export default function OnboardingForm() {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectOnboardingData);
  const status = useSelector(selectOnboardingStatus);
  const error = useSelector(selectOnboardingError);
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatarUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      preferredName: '',
      profilePicture: undefined,
      address: {
        addressOne: '',
        addressTwo: '',
        city: '',
        state: '',
        zipCode: '',
      },
      cellPhone: '',
      workPhone: '',
      email: 'user@example.com', // Pre-filled example
      ssn: '',
      dateOfBirth: '',
      gender: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    dispatch(submitOnboardingForm(values));
  }

  useEffect(() => {
    if (status === 'succeeded') {
      toast.success('Form submitted successfully!');
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
          {/* name */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
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

          {/* profile picture */}
          <div className="flex flex-row items-center">
            <FormField
              control={form.control}
              name="profilePicture"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex flex-row items-center w-full">
                    <div className="flex-grow mr-10">
                      <FormLabel>Upload profile picture</FormLabel>
                      <FormControl>
                        <Input className="mt-4" placeholder="enter image url" value={avatarPreview} />
                      </FormControl>
                    </div>

                    <div className="text-center">
                      <Avatar className="w-28 h-28">
                        <AvatarImage src={avatarPreview} alt="Profile Picture" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <p>preview</p>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* address */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
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

              <FormField
                control={form.control}
                name="address.addressTwo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex">
                      Address line 2 <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex">
                      City <span className="text-red-500 ml-1">*</span>
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
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex">
                      State<span className="text-red-500 ml-1">*</span>
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
                name="address.zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex">
                      Zipcode<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* phone number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <FormField
              control={form.control}
              name="cellPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex">
                    Cell Phone<span className="text-red-500 ml-1">*</span>
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
              name="workPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex">
                    Work Phone<span className="text-red-500 ml-1"></span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex mt-8">
                  Email<span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          {/* ssn & date of birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <FormField
              control={form.control}
              name="ssn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex">
                    SSN<span className="text-red-500 ml-1">*</span>
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
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex">
                    Date of Birth<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value?.split('T')[0] || ''}
                      onChange={(e) => {
                        const value = e.target.value ? `${e.target.value}T00:00:00Z` : '';
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex mt-8">
                  Gender<span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={'placeholder'} disabled>
                        Choose gender
                      </SelectItem>
                      <SelectItem value={Gender.Male}>Male</SelectItem>
                      <SelectItem value={Gender.Female}>Female</SelectItem>
                      <SelectItem value={Gender.PreferNotToSay}>Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
