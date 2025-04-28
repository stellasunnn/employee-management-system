import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import {
  submitOnboardingForm,
  selectOnboardingData,
  selectOnboardingStatus,
  selectOnboardingError,
  updateFormData,
} from '@/store/slices/onboardingSlice';
import { uploadDocument } from '@/store/slices/uploadDocumentSlice';
import { useEffect, useState } from 'react';
import { AppDispatch } from '@/store/store';
import { useNavigate } from 'react-router-dom';
import { pageTwoSchema } from './schema';

const CitizenshipType = {
  GreenCard: 'green_card',
  Citizen: 'citizen',
  WorkAuthorization: 'work_authorization',
} as const;

const WorkAuthorizationType = {
  H1B: 'H1-B',
  H4: 'H4',
  L2: 'L2',
  F1: 'F1',
  Other: 'other',
} as const;

const DocumentType = {
  DriverLicense: 'driver_license',
  WorkAuthorization: 'work_authorization',
  OptReceipt: 'opt_receipt',
  Other: 'other',
} as const;

type DocumentTypeValues = (typeof DocumentType)[keyof typeof DocumentType];

export default function CitizenshipAndReferencesForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const formData = useSelector(selectOnboardingData);
  const status = useSelector(selectOnboardingStatus);
  const error = useSelector(selectOnboardingError);

  const [isPermanentResident, setIsPermanentResident] = useState(
    formData.citizenshipStatus?.isPermanentResident || false,
  );

  const [workAuthType, setWorkAuthType] = useState<string>(formData?.citizenshipStatus?.workAuthorizationType || '');

  const [documents, setDocuments] = useState<File[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState<{ [key: string]: string }>({});

  const form = useForm<z.infer<typeof pageTwoSchema>>({
    resolver: zodResolver(pageTwoSchema),
    defaultValues: {
      citizenshipStatus: formData?.citizenshipStatus || {
        isPermanentResident: false,
        type: undefined,
        workAuthorizationType: undefined,
        workAuthorizationOther: '',
        startDate: '',
        expirationDate: '',
      },
      reference: formData?.reference || {
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        relationship: '',
      },
      emergencyContacts: formData?.emergencyContacts || [
        {
          firstName: '',
          middleName: '',
          lastName: '',
          phone: '',
          email: '',
          relationship: '',
        },
      ],
      documents: formData?.documents || [],
    },
  });

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: DocumentTypeValues) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const formData = new FormData();

      formData.append('fileName', file.name);
      formData.append('file', file);
      formData.append('type', type);

      dispatch(uploadDocument(formData))
        .unwrap()
        .then((response) => {
          const currentDocuments = form.getValues().documents || [];

          const newDocument = {
            type: type,
            fileName: file.name,
            fileUrl: response.url,
            uploadDate: new Date(),
          };

          dispatch(
            updateFormData({
              documents: [...currentDocuments, newDocument],
            }),
          );
        })
        .catch((error) => {
          console.error('Upload failed:', error);
        });
    }
  };

  // Handle back (to page 1)
  const handleBack = () => {
    const values = form.getValues();
    dispatch(
      updateFormData({
        ...formData,
        ...values,
      }),
    );
    navigate('/onboarding');
  };

  function onSubmit(values: z.infer<typeof pageTwoSchema>) {
    // First, update Redux with the current form values
    dispatch(updateFormData(values));

    // Then, get the latest combined data from Redux and submit it
    const completeData = {
      ...formData, // This is the existing data from page 1
      ...values, // This is the current data from page 2
    };

    console.log('Submitting combined data:', completeData);
    dispatch(submitOnboardingForm(completeData));
  }

  useEffect(() => {
    if (status === 'succeeded') {
      toast.success('Form submitted successfully!');
      navigate('/dashboard');
    } else if (status === 'failed' && error) {
      toast.error(error);
    }
  }, [status, error, navigate]);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Citizenship & References</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Citizenship Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Citizenship Status</h3>

            <FormField
              control={form.control}
              name="citizenshipStatus.isPermanentResident"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex">
                    Are you a permanent resident or citizen of the U.S.?<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        const isResident = value === 'true';
                        setIsPermanentResident(isResident);
                        field.onChange(isResident);
                      }}
                      defaultValue={field.value ? 'true' : 'false'}
                      className="flex flex-row space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="yes" />
                        <label htmlFor="yes">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="no" />
                        <label htmlFor="no">No</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional fields based on citizenship status */}
            {isPermanentResident ? (
              <FormField
                control={form.control}
                name="citizenshipStatus.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex">
                      Status Type<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CitizenshipType.GreenCard}>Green Card</SelectItem>
                        <SelectItem value={CitizenshipType.Citizen}>Citizen</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="citizenshipStatus.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="citizenshipStatus.workAuthorizationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        What is your work authorization?<span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setWorkAuthType(value);
                          field.onChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work authorization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={WorkAuthorizationType.H1B}>H1-B</SelectItem>
                          <SelectItem value={WorkAuthorizationType.H4}>H4</SelectItem>
                          <SelectItem value={WorkAuthorizationType.L2}>L2</SelectItem>
                          <SelectItem value={WorkAuthorizationType.F1}>F1 (CPT/OPT)</SelectItem>
                          <SelectItem value={WorkAuthorizationType.Other}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {workAuthType === WorkAuthorizationType.Other && (
                  <FormField
                    control={form.control}
                    name="citizenshipStatus.workAuthorizationOther"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex">
                          Please specify<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {workAuthType === WorkAuthorizationType.F1 && (
                  <div className="border p-4 rounded-md bg-gray-50">
                    <p className="mb-2">Please upload your OPT Receipt</p>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, DocumentType.OptReceipt)}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="citizenshipStatus.startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        Start Date<span className="text-red-500 ml-1">*</span>
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
                <FormField
                  control={form.control}
                  name="citizenshipStatus.expirationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        Expiration Date<span className="text-red-500 ml-1">*</span>
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
            )}
          </div>

          {/* Reference Information */}
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold">Reference Information</h3>
            <FormField
              control={form.control}
              name="reference.firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex">
                    First Name<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reference.middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference.lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex">
                      Last Name<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reference.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex">
                      Phone<span className="text-red-500 ml-1">*</span>
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
                name="reference.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex">
                      Email<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reference.relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex">
                    Relationship<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold">Emergency Contact</h3>

            {form.watch('emergencyContacts')?.map((_, index) => (
              <Card key={index} className="p-4">
                <CardContent className="p-0 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`emergencyContacts.${index}.firstName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex">
                            First Name<span className="text-red-500 ml-1">*</span>
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
                      name={`emergencyContacts.${index}.middleName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`emergencyContacts.${index}.lastName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex">
                            Last Name<span className="text-red-500 ml-1">*</span>
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
                      name={`emergencyContacts.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex">
                            Phone<span className="text-red-500 ml-1">*</span>
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
                      name={`emergencyContacts.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex">
                            Email<span className="text-red-500 ml-1">*</span>
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
                      name={`emergencyContacts.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex">
                            Relationship<span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const currentContacts = form.getValues().emergencyContacts || [];
                form.setValue('emergencyContacts', [
                  ...currentContacts,
                  { firstName: '', middleName: '', lastName: '', phone: '', email: '', relationship: '' },
                ]);
              }}
            >
              Add Another Emergency Contact
            </Button>
          </div>

          {/* Document Uploads */}
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold">Required Documents</h3>

            <div className="border p-4 rounded-md">
              <FormLabel className="block mb-2">Driver's License</FormLabel>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, DocumentType.DriverLicense)}
              />
              {documentPreviews[DocumentType.DriverLicense] && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">File uploaded</p>
                </div>
              )}
            </div>

            {!isPermanentResident && (
              <div className="border p-4 rounded-md">
                <FormLabel className="block mb-2">Work Authorization Document</FormLabel>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, DocumentType.WorkAuthorization)}
                />
                {documentPreviews['work_authorization'] && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">File uploaded</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
