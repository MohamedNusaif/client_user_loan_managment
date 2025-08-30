import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

import React, { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

// ✅ Define TypeScript Interfaces
interface PersonalInfo {
  fullName: string;
  contactNumber: string;
  email: string;
  dateOfBirth: Date;
  address: string;
  district: string;
}

interface IdentityVerification {
  idNumber: string;
}

interface EmploymentDetails {
  employer: string;
  jobRole: string;
  monthlyIncome: string;
  employmentDuration: string;
}

interface FormData {
  personalInfo: PersonalInfo;
  identityVerification: IdentityVerification;
  employmentDetails: EmploymentDetails;
}

interface ImageFile {
  uri: string;
}

interface ValidationErrors {
  personalInfo: {
    fullName?: string;
    contactNumber?: string;
    email?: string;
    dateOfBirth?: string;
    address?: string;
    district?: string;
  };
  identityVerification: {
    idNumber?: string;
  };
  employmentDetails: {
    employer?: string;
    jobRole?: string;
    monthlyIncome?: string;
    employmentDuration?: string;
  };
  idCardCopy?: string;
  employmentLetterCopy?: string;
}

const CreateUserScreen: React.FC = () => {
  // ✅ State with Type Safety
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      fullName: '',
      contactNumber: '',
      email: '',
      dateOfBirth: new Date(),
      address: '',
      district: '',
    },
    identityVerification: {
      idNumber: '',
    },
    employmentDetails: {
      employer: '',
      jobRole: '',
      monthlyIncome: '',
      employmentDuration: '',
    },
  });

  const [idCardCopy, setIdCardCopy] = useState<ImageFile | null>(null);
  const [employmentLetterCopy, setEmploymentLetterCopy] = useState<ImageFile | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    personalInfo: {},
    identityVerification: {},
    employmentDetails: {},
  });

  const API_URL = 'http://10.152.237.129:5000/clientsAPI/register';

  // ✅ Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ Validate phone number format (Sri Lankan format)
  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+94|0)(7[0-9]|70|71|72|75|76|77|78|81|91)[0-9]{7}$/;
    return phoneRegex.test(phone);
  };

  // ✅ Validate NIC format (Sri Lankan format)
  const isValidNIC = (nic: string): boolean => {
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    return nicRegex.test(nic);
  };

  // ✅ Validate all form fields
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      personalInfo: {},
      identityVerification: {},
      employmentDetails: {},
    };

    // Personal Info Validation
    if (!formData.personalInfo.fullName.trim()) {
      errors.personalInfo.fullName = 'Full name is required';
    }

    if (!formData.personalInfo.email.trim()) {
      errors.personalInfo.email = 'Email is required';
    } else if (!isValidEmail(formData.personalInfo.email)) {
      errors.personalInfo.email = 'Please enter a valid email address';
    }

    if (!formData.personalInfo.contactNumber.trim()) {
      errors.personalInfo.contactNumber = 'Contact number is required';
    } else if (!isValidPhoneNumber(formData.personalInfo.contactNumber)) {
      errors.personalInfo.contactNumber = 'Please enter a valid Sri Lankan phone number';
    }

    if (!formData.personalInfo.dateOfBirth) {
      errors.personalInfo.dateOfBirth = 'Date of birth is required';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.personalInfo.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        errors.personalInfo.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    if (!formData.personalInfo.address.trim()) {
      errors.personalInfo.address = 'Address is required';
    }

    if (!formData.personalInfo.district.trim()) {
      errors.personalInfo.district = 'District is required';
    }

    // Identity Verification Validation
    if (!formData.identityVerification.idNumber.trim()) {
      errors.identityVerification.idNumber = 'ID number is required';
    } else if (!isValidNIC(formData.identityVerification.idNumber)) {
      errors.identityVerification.idNumber = 'Please enter a valid Sri Lankan NIC number';
    }

    // Employment Details Validation
    if (!formData.employmentDetails.employer.trim()) {
      errors.employmentDetails.employer = 'Company name is required';
    }

    if (!formData.employmentDetails.jobRole.trim()) {
      errors.employmentDetails.jobRole = 'Job role is required';
    }

    if (!formData.employmentDetails.monthlyIncome.trim()) {
      errors.employmentDetails.monthlyIncome = 'Monthly income is required';
    } else if (isNaN(Number(formData.employmentDetails.monthlyIncome)) || 
               Number(formData.employmentDetails.monthlyIncome) <= 0) {
      errors.employmentDetails.monthlyIncome = 'Please enter a valid monthly income';
    }

    if (!formData.employmentDetails.employmentDuration.trim()) {
      errors.employmentDetails.employmentDuration = 'Employment duration is required';
    }

    // Image Validation
    if (!idCardCopy) {
      errors.idCardCopy = 'ID card copy is required';
    }

    if (!employmentLetterCopy) {
      errors.employmentLetterCopy = 'Employment letter is required';
    }

    setValidationErrors(errors);

    // Check if there are any errors
    return Object.keys(errors.personalInfo).length === 0 &&
           Object.keys(errors.identityVerification).length === 0 &&
           Object.keys(errors.employmentDetails).length === 0 &&
           !errors.idCardCopy &&
           !errors.employmentLetterCopy;
  };

  // ✅ Strongly Typed Handle Input Change
  const handleInputChange = (
    section: keyof FormData,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear validation error when user starts typing
    setValidationErrors((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: undefined,
      },
    }));
  };

  // ✅ Date Picker Handler
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          dateOfBirth: selectedDate,
        },
      }));
      
      // Clear date validation error
      setValidationErrors((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          dateOfBirth: undefined,
        },
      }));
    }
  };

  // ✅ Image Picker
  const selectImage = async (type: 'idCard' | 'employmentLetter') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please enable photo access in settings');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (type === 'idCard') {
        setIdCardCopy({ uri });
        // Clear image validation error
        setValidationErrors((prev) => ({
          ...prev,
          idCardCopy: undefined,
        }));
      } else {
        setEmploymentLetterCopy({ uri });
        // Clear image validation error
        setValidationErrors((prev) => ({
          ...prev,
          employmentLetterCopy: undefined,
        }));
      }
    }
  };

  // ✅ Submit Handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    try {
      const data = new FormData();
      data.append(
        'data',
        JSON.stringify({
          ...formData,
          personalInfo: {
            ...formData.personalInfo,
            dateOfBirth: formData.personalInfo.dateOfBirth.toISOString(),
          },
        })
      );

      // ✅ Append Images Correctly
      data.append('idCard', {
        uri: idCardCopy!.uri,
        name: 'idCard.jpg',
        type: 'image/jpeg',
      } as any);

      data.append('employmentLetter', {
        uri: employmentLetterCopy!.uri,
        name: 'employmentLetter.jpg',
        type: 'image/jpeg',
      } as any);
      
      const response = await axios.post(API_URL, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Client registered successfully!');
      console.log('✅ Server Response:', response.data);

      // ✅ Reset Form
      setFormData({
        personalInfo: {
          fullName: '',
          contactNumber: '',
          email: '',
          dateOfBirth: new Date(),
          address: '',
          district: '',
        },
        identityVerification: {
          idNumber: '',
        },
        employmentDetails: {
          employer: '',
          jobRole: '',
          monthlyIncome: '',
          employmentDuration: '',
        },
      });
      setIdCardCopy(null);
      setEmploymentLetterCopy(null);
      setValidationErrors({
        personalInfo: {},
        identityVerification: {},
        employmentDetails: {},
      });
    } catch (error: any) {
      if (error.response) {
        console.error('🚨 Server Error:', error.response.data);
        Alert.alert('Error', error.response.data.message || 'Server error occurred');
      } else if (error.request) {
        console.error('📡 No response received:', error.request);
        Alert.alert(
          'Network Error',
          'No response from server. Check your internet or backend server.'
        );
      } else {
        console.error('❌ Request Error:', error.message);
        Alert.alert('Error', 'Request failed: ' + error.message);
      }
    }
  };

  // ✅ Format Date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ImageBackground source={require('../assets/images/bg.png')} style={styles.background}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Personal Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[
                styles.input, 
                validationErrors.personalInfo.fullName && styles.inputError
              ]}
              value={formData.personalInfo.fullName}
              onChangeText={(text) => handleInputChange('personalInfo', 'fullName', text)}
              placeholder="Enter full name"
            />
            {validationErrors.personalInfo.fullName && (
              <Text style={styles.errorText}>{validationErrors.personalInfo.fullName}</Text>
            )}

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[
                styles.input, 
                validationErrors.personalInfo.email && styles.inputError
              ]}
              value={formData.personalInfo.email}
              onChangeText={(text) => handleInputChange('personalInfo', 'email', text)}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {validationErrors.personalInfo.email && (
              <Text style={styles.errorText}>{validationErrors.personalInfo.email}</Text>
            )}

            <Text style={styles.label}>Contact Number *</Text>
            <TextInput
              style={[
                styles.input, 
                validationErrors.personalInfo.contactNumber && styles.inputError
              ]}
              value={formData.personalInfo.contactNumber}
              onChangeText={(text) => handleInputChange('personalInfo', 'contactNumber', text)}
              placeholder="Enter phone number (e.g., +94771234567)"
              keyboardType="phone-pad"
            />
            {validationErrors.personalInfo.contactNumber && (
              <Text style={styles.errorText}>{validationErrors.personalInfo.contactNumber}</Text>
            )}

            <Text style={styles.label}>Date of Birth *</Text>
            <TouchableOpacity
              style={[
                styles.datePickerButton, 
                validationErrors.personalInfo.dateOfBirth && styles.inputError
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons name="calendar-today" size={20} color="#555" />
              <Text style={styles.datePickerText}>
                {formatDate(formData.personalInfo.dateOfBirth)}
              </Text>
            </TouchableOpacity>
            {validationErrors.personalInfo.dateOfBirth && (
              <Text style={styles.errorText}>{validationErrors.personalInfo.dateOfBirth}</Text>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={formData.personalInfo.dateOfBirth}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[
                styles.input, 
                validationErrors.personalInfo.address && styles.inputError
              ]}
              value={formData.personalInfo.address}
              onChangeText={(text) => handleInputChange('personalInfo', 'address', text)}
              placeholder="Enter address"
            />
            {validationErrors.personalInfo.address && (
              <Text style={styles.errorText}>{validationErrors.personalInfo.address}</Text>
            )}

            <Text style={styles.label}>District *</Text>
            <View style={[
              styles.pickerContainer, 
              validationErrors.personalInfo.district && styles.inputError
            ]}>
              <Picker
                selectedValue={formData.personalInfo.district}
                onValueChange={(value) => handleInputChange('personalInfo', 'district', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select District" value="" />
                <Picker.Item label="Colombo" value="Colombo" />
                <Picker.Item label="Gampaha" value="Gampaha" />
                <Picker.Item label="Kalutara" value="Kalutara" />
                <Picker.Item label="Kandy" value="Kandy" />
                <Picker.Item label="Matale" value="Matale" />
                <Picker.Item label="Nuwara Eliya" value="Nuwara Eliya" />
                <Picker.Item label="Galle" value="Galle" />
                <Picker.Item label="Matara" value="Matara" />
                <Picker.Item label="Hambantota" value="Hambantota" />
                <Picker.Item label="Jaffna" value="Jaffna" />
                <Picker.Item label="Kilinochchi" value="Kilinochchi" />
                <Picker.Item label="Mannar" value="Mannar" />
                <Picker.Item label="Vavuniya" value="Vavuniya" />
                <Picker.Item label="Mullaitivu" value="Mullaitivu" />
                <Picker.Item label="Batticaloa" value="Batticaloa" />
                <Picker.Item label="Ampara" value="Ampara" />
                <Picker.Item label="Trincomalee" value="Trincomalee" />
                <Picker.Item label="Kurunegala" value="Kurunegala" />
                <Picker.Item label="Puttalam" value="Puttalam" />
                <Picker.Item label="Anuradhapura" value="Anuradhapura" />
                <Picker.Item label="Polonnaruwa" value="Polonnaruwa" />
                <Picker.Item label="Badulla" value="Badulla" />
                <Picker.Item label="Monaragala" value="Monaragala" />
                <Picker.Item label="Ratnapura" value="Ratnapura" />
                <Picker.Item label="Kegalle" value="Kegalle" />
              </Picker>
              <MaterialIcons 
                name="arrow-drop-down" 
                size={24} 
                color="#555" 
                style={styles.pickerIcon} 
              />
            </View>
            {validationErrors.personalInfo.district && (
              <Text style={styles.errorText}>{validationErrors.personalInfo.district}</Text>
            )}
          </View>

          {/* Employment Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Employment Information</Text>

            <Text style={styles.label}>ID Number *</Text>
            <TextInput
              style={[
                styles.input, 
                validationErrors.identityVerification.idNumber && styles.inputError
              ]}
              value={formData.identityVerification.idNumber}
              onChangeText={(text) =>
                handleInputChange('identityVerification', 'idNumber', text)
              }
              placeholder="Enter ID number (NIC)"
            />
            {validationErrors.identityVerification.idNumber && (
              <Text style={styles.errorText}>{validationErrors.identityVerification.idNumber}</Text>
            )}

            <Text style={styles.label}>Upload ID Card Copy *</Text>
            <TouchableOpacity
              style={[
                styles.uploadButton, 
                validationErrors.idCardCopy && styles.inputError
              ]}
              onPress={() => selectImage('idCard')}
            >
              {idCardCopy ? (
                <Image source={idCardCopy} style={styles.uploadedImage} />
              ) : (
                <Text style={styles.uploadButtonText}>+ Upload</Text>
              )}
            </TouchableOpacity>
            {validationErrors.idCardCopy && (
              <Text style={styles.errorText}>{validationErrors.idCardCopy}</Text>
            )}

            <Text style={styles.label}>Company *</Text>
            <TextInput
              style={[
                styles.input, 
                validationErrors.employmentDetails.employer && styles.inputError
              ]}
              value={formData.employmentDetails.employer}
              onChangeText={(text) =>
                handleInputChange('employmentDetails', 'employer', text)
              }
              placeholder="Company Name"
            />
            {validationErrors.employmentDetails.employer && (
              <Text style={styles.errorText}>{validationErrors.employmentDetails.employer}</Text>
            )}

            <Text style={styles.label}>Job Role *</Text>
            <TextInput
              style={[
                styles.input, 
                validationErrors.employmentDetails.jobRole && styles.inputError
              ]}
              value={formData.employmentDetails.jobRole}
              onChangeText={(text) =>
                handleInputChange('employmentDetails', 'jobRole', text)
              }
              placeholder="Enter job role"
            />
            {validationErrors.employmentDetails.jobRole && (
              <Text style={styles.errorText}>{validationErrors.employmentDetails.jobRole}</Text>
            )}

            <Text style={styles.label}>Monthly Income (LKR) *</Text>
            <TextInput
              style={[
                styles.input, 
                validationErrors.employmentDetails.monthlyIncome && styles.inputError
              ]}
              value={formData.employmentDetails.monthlyIncome}
              onChangeText={(text) =>
                handleInputChange('employmentDetails', 'monthlyIncome', text)
              }
              placeholder="Enter monthly income"
              keyboardType="numeric"
            />
            {validationErrors.employmentDetails.monthlyIncome && (
              <Text style={styles.errorText}>{validationErrors.employmentDetails.monthlyIncome}</Text>
            )}

            <Text style={styles.label}>Employment Duration *</Text>
            <TextInput
              style={[
                styles.input, 
                validationErrors.employmentDetails.employmentDuration && styles.inputError
              ]}
              value={formData.employmentDetails.employmentDuration}
              onChangeText={(text) =>
                handleInputChange('employmentDetails', 'employmentDuration', text)
              }
              placeholder="Enter duration (e.g., 3 years)"
            />
            {validationErrors.employmentDetails.employmentDuration && (
              <Text style={styles.errorText}>{validationErrors.employmentDetails.employmentDuration}</Text>
            )}

            <Text style={styles.label}>Upload Employment Letter *</Text>
            <TouchableOpacity
              style={[
                styles.uploadButton, 
                validationErrors.employmentLetterCopy && styles.inputError
              ]}
              onPress={() => selectImage('employmentLetter')}
            >
              {employmentLetterCopy ? (
                <Image source={employmentLetterCopy} style={styles.uploadedImage} />
              ) : (
                <Text style={styles.uploadButtonText}>+ Upload</Text>
              )}
            </TouchableOpacity>
            {validationErrors.employmentLetterCopy && (
              <Text style={styles.errorText}>{validationErrors.employmentLetterCopy}</Text>
            )}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    marginTop: 15,
    fontWeight: '500',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 15,
    justifyContent: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
  pickerIcon: {
    position: 'absolute',
    right: 10,
    pointerEvents: 'none',
  },
  uploadButton: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#666',
    fontSize: 16,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  datePickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#000',
    height: 45,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateUserScreen;