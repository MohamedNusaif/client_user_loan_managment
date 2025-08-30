import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  RefreshControl,
  Dimensions 
} from 'react-native';
import API from '../services/api';

const { width } = Dimensions.get('window');

const UserDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loanData, setLoanData] = useState({
    currentLoan: 150000,
    emiAmount: 15000,
    dueDate: '15-May-2025',
    nextDueDate: '15-Jun-2025'
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUser().then(() => setRefreshing(false));
  }, []);

  const fetchUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser.userId;
        
        const response = await API.get(`/clientsAPI/${userId}`);
        console.log(response.data);
        
        const fullUserData = response.data;
        console.log('Fetched user from backend:', fullUserData);

        setUser(fullUserData.data);
      } else {
        console.log('No user found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person-circle-outline" size={60} color="#3b5998" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with User Info */}
      <LinearGradient colors={['#3b5998', '#192f6a']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          <Image
            source={require('../assets/images/user-avatar.jpeg')}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user.personalInfo.fullName}</Text>
            <Text style={styles.email}>{user.personalInfo.email}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 89, 152, 0.1)' }]}>
            <Ionicons name="wallet-outline" size={24} color="#3b5998" />
          </View>
          <Text style={styles.statValue}>Rs {loanData.currentLoan.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Current Loan</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(220, 53, 69, 0.1)' }]}>
            <Ionicons name="calendar-outline" size={24} color="#dc3545" />
          </View>
          <Text style={styles.statValue}>{loanData.dueDate}</Text>
          <Text style={styles.statLabel}>Next Due Date</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#28a745' }]} 
            onPress={() => router.push('/applyLoan')}
          >
            <Ionicons name="add-circle-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>Apply Loan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#dc3545' }]} 
            onPress={() => router.push('/payLoan')}
          >
            <Ionicons name="card-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>Pay EMI</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#ffc107' }]}
          >
            <Ionicons name="document-text-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>Statement</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* EMI Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current EMI Details</Text>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.emiCard}>
          <View style={styles.emiHeader}>
            <Text style={styles.emiTitle}>Monthly Installment</Text>
            <View style={styles.dueBadge}>
              <Text style={styles.dueBadgeText}>Due</Text>
            </View>
          </View>
          <Text style={styles.emiAmount}>Rs {loanData.emiAmount.toLocaleString()}</Text>
          <Text style={styles.emiDueDate}>Due by {loanData.dueDate}</Text>
          
          <TouchableOpacity 
            style={styles.payButton}
            onPress={() => router.push('/payLoan')}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Activity Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {[ 
          { 
            type: 'EMI Payment', 
            status: 'Due', 
            amount: 'Rs 15,000.00', 
            date: '15-May-2025',
            icon: 'cash-outline',
            color: '#dc3545'
          },
          { 
            type: 'EMI Payment', 
            status: 'Paid', 
            amount: 'Rs 15,000.00', 
            date: '15-Apr-2025',
            icon: 'checkmark-circle-outline',
            color: '#28a745'
          },
          { 
            type: 'Loan Disbursed', 
            status: 'Completed', 
            amount: 'Rs 150,000.00', 
            date: '15-Mar-2025',
            icon: 'business-outline',
            color: '#3b5998'
          },
        ].map((item, index) => (
          <View key={index} style={styles.activityCard}>
            <View style={[styles.activityIcon, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            
            <View style={styles.activityContent}>
              <View style={styles.activityRow}>
                <Text style={styles.activityLabel}>{item.type}</Text>
                <Text
                  style={[
                    styles.activityStatus,
                    { color: item.status === 'Due' ? '#dc3545' : '#28a745' }
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              <View style={styles.activityRow}>
                <Text style={styles.activityAmount}>{item.amount}</Text>
                <Text style={styles.activityDate}>{item.date}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Footer Space */}
      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: -30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    width: (width - 50) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
    fontWeight: '500',
  },
  emiCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emiTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dueBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueBadgeText: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emiAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emiDueDate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 15,
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#667eea',
    fontWeight: 'bold',
    marginRight: 5,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activityStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b5998',
    fontWeight: '500',
  },
  footer: {
    height: 30,
  },
});

export default UserDashboard;