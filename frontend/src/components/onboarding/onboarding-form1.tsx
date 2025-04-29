import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectOnboardingData,
  selectOnboardingStatus,
  selectOnboardingError,
  setCurrentStep,
  updateFormData,
  selectApplicationStatus,
  selectCurrentStep,
  setRequestSubmitFromHome,
  selectRequestSubmitFromHome
} from '@/store/slices/onboardingSlice';
import { useEffect, useState } from 'react';
import { AppDispatch, RootState } from '@/store/store';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplicationStatus, pageOneSchema, pageTwoSchema } from './schema';
import { Gender } from './schema';
import { OnboardingFormData } from './schema';

interface OnboardingFormProps {
  initialData?: OnboardingFormData;
  isResubmission?: boolean;
  isEditMode?: boolean;
}

const defaultAvatarUrl =
  'https://img.freepik.com/premium-vector/software-developer-vector-illustration-communication-technology-cyber-security_1249867-5464.jpg';

export default function OnboardingForm({
  initialData,
  isResubmission = false,
  isEditMode = false,
}: OnboardingFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(selectOnboardingData);
  const status = useSelector(selectOnboardingStatus);
  const applicationStatus = useSelector(selectApplicationStatus);
  const error = useSelector(selectOnboardingError);
  const [avatarPreview, setAvatarPreview] = useState(initialData?.profilePicture || defaultAvatarUrl);
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const currentStep = useSelector(selectCurrentStep);
  const requestSubmitFromHome = useSelector(selectRequestSubmitFromHome)

  const form = useForm<z.infer<typeof pageOneSchema>>({
    resolver: zodResolver(pageOneSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    if (formData && currentStep === 1) {
      form.reset(formData);
    }
  }, [formData, form.reset, currentStep]);

  useEffect(() => {
    if (user) {
      dispatch(updateFormData({ email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    if(requestSubmitFromHome && isEditMode){
      console.log("Submitting form 1")
      form.handleSubmit((onSubmit))();
      dispatch(setRequestSubmitFromHome(false))
    }
  },[requestSubmitFromHome, dispatch, form, isEditMode])

  function onSubmit(values: z.infer<typeof pageOneSchema>) {
    dispatch(updateFormData(values));
    if (isResubmission) {
      toast.success('Form updated successfully!');
    }
    if (!isEditMode) {
      dispatch(setCurrentStep(2));
    }
  }

  useEffect(() => {
    if (status === 'failed' && applicationStatus !== ApplicationStatus.NeverSubmitted && error) {
      toast.error(error);
    }
  }, [status, error, form, dispatch]);

  return (
    <div className={`w-full max-w-3xl mx-auto p-6 bg-white ${isEditMode ? '' : 'rounded-lg shadow'}`}>
      {!isEditMode && <h2 className="text-xl font-bold mb-4">Onboarding Form</h2>}

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
                        <Input
                          className="mt-4"
                          placeholder="enter image url"
                          value={avatarPreview}
                          onChange={(e) => {
                            setAvatarPreview(e.target.value);
                            field.onChange(e);
                          }}
                        />
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
                    <FormLabel className="flex">Address line 2</FormLabel>
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
                  <Input {...field} disabled />
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

          {!isEditMode && <Button type="submit" className="w-full">
            {isResubmission ? 'Continue Updates' : 'Next Page'}
          </Button>}
        </form>
      </Form>
    </div>
  );
}
