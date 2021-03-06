import React, { Component, useState } from 'react';
import { StatusBar, AsyncStorage, View, Text, RefreshControl } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

import global from './global';
import Authentication from './Authentication/Authentication';
import OrderHistory from './OrderHistory/OrderHistory';
import OrderDetail from './OrderHistory/OrderDetail';
import ChangeInfo from './ChangeInfo/ChangeInfo';



import Shop from './Shop/Shop';
import Cart from './Shop/Cart/Cart';
import Contact from './Shop/Contact/Contact';
import Search from './Shop/Search/Search';

import SignIn from './Authentication/SignIn';
import SignUp from './Authentication/SignUp';

import Detail from './ProductDetail/Detail';
import ListProduct from './ListProduct/ListProduct';


import { IsLogin } from './DrawerContent/IsLogin';
import { NotLogin } from './DrawerContent/NotLogin';

import {firebaseApp} from './FirebaseConfig.js';
import { connect } from 'react-redux';
import store from '../store';
import { withSafeAreaInsets } from 'react-native-safe-area-context';






StatusBar.setHidden(true);

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const ProductStack = createStackNavigator();
const CartStack = createStackNavigator();
const SearchStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const OrderStack = createStackNavigator();



class Index extends Component {
    _isMounted=false;
    constructor(props){
        super(props);
        this.state = {
            isSingedIn: false,
            cartArray: []
        };
        global.addProductToCart= this.addProductToCart.bind(this);
        global.clearCart = this.clearCart.bind(this);
        global.cartGlobal = this.state.cartArray;
    }


    Home() {
        return (
            <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Shop') {
                    iconName = focused
                    ? 'ios-home'
                    : 'ios-home';
                } else if (route.name === 'Cart') {
                    return (
                        <CartIconWithBadge
                        name={'md-cart'}
                        size={size}
                        color={color}
                        
                        />
                    );
                } else if (route.name === 'Search') {
                    iconName = focused ? 'md-search' : 'md-search';
                } else if (route.name === 'Contact') {
                    iconName = focused ? 'md-contacts' : 'md-contacts';
                }
                  // You can return any component that you like here!
                return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
            tabBarOptions={{
                activeTintColor: '#2BD9C8',
                inactiveTintColor: '#AFAEAF',
            }}
            >
                <Tab.Screen name="Shop" component={createProductStack} />
                <Tab.Screen name="Cart" component={createCartStack} />
                <Tab.Screen name="Search" component={createSearchStack} />
                <Tab.Screen name="Contact" component={ContactScreen} />
            </Tab.Navigator>
        );
    
    }
    
    
    render() {
        return (
            <NavigationContainer>
                { this.state.isSingedIn ? (
                    <Drawer.Navigator initialRouteName="Main" drawerContent = { props => <IsLogin { ... props} />}>
                        <Drawer.Screen name="Main" component={this.Home} />
                        <Drawer.Screen name="Profile" component={Profile} />
                        <Drawer.Screen name="Order" component={createOrderStack} />
                </Drawer.Navigator>
                ) : (
                    <Drawer.Navigator initialRouteName="Main" drawerContent = { props => <NotLogin { ... props} />}>
                        <Drawer.Screen name="Main" component={this.Home} />
                        <Drawer.Screen name="SignIn" component={SignInScreen} />
                        <Drawer.Screen name="SignUp" component={SignUpScreen} />
                </Drawer.Navigator>
                )}
                
            </NavigationContainer>
        );
    }
    componentDidMount(){
        this._isMounted = true;
        firebaseApp.auth().onAuthStateChanged(user => {
            if(user){
                this.setState({
                    isSingedIn: true
                })
                var user = firebaseApp.auth().currentUser;
                var db= firebaseApp.firestore();
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();

                today = mm + '/' + dd + '/' + yyyy;

                db.collection('Users').doc(user.uid).get()
                .then((docSnapshot) => {
                    if (!docSnapshot.exists) {
                        db.collection("Users").doc(user.uid).set({
                            email: user.email,
                            createdDate: today,
                            name: "",
                            address: "",
                            phone: ""
                            }).then(()=>{
                        });
                    }
                });
            }
            else{
                this.setState({
                    isSingedIn: false
                })
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    addProductToCart = (product) => {
        let items= this.state.cartArray.concat(product);
        this.setState({
            cartArray: items
        },()=>{
            global.cartGlobal=this.state.cartArray;
        });
    }

    clearCart = () => {
        this.setState({
            cartArray: []
        },()=>{
            global.cartGlobal=this.state.cartArray;
        });
    }

}

// Badge to Icon


store.subscribe(() =>{

});


function IconWithBadge({ name, badgeCount, color, size }) {
    return (
        <View style={{ width: 24, height: 24, margin: 5 }}>
        <Ionicons name={name} size={size} color={color} />
        {badgeCount > 0 && (
            <View
            style={{
                // On React Native < 0.57 overflow outside of parent will not work on Android, see https://git.io/fhLJ8
                position: 'absolute',
                right: -6,
                top: -3,
                backgroundColor: '#2BD9C8',
                borderRadius: 6,
                width: 12,
                height: 12,
                justifyContent: 'center',
                alignItems: 'center',
            }}
            >
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                {badgeCount}
            </Text>
            </View>
        )}
        </View>
    );
}

function CartIconWithBadge(props) {
// You should pass down the badgeCount in some other ways like React Context API, Redux, MobX or event emitters.
return <IconWithBadge {...props} badgeCount={store.getState().counter.length} />;
}


// Stack Navigator
function Home() {
    return (
        <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Shop') {
                iconName = focused
                ? 'ios-home'
                : 'ios-home';
            } else if (route.name === 'Cart') {
                return (
                    // <CartIconWithBadge
                    // name={
                    //     focused
                    //     ? 'md-cart'
                    //     : 'md-cart'
                    // }
                    // size={size}
                    // color={color}
                    // />
                    

                    <View style={{ width: 24, height: 24, margin: 5 }}>
                    <Ionicons name={name} size={size} color={color} />
                    {store.getState().counter.length > 0 && (
                        <View
                        style={{
                            // On React Native < 0.57 overflow outside of parent will not work on Android, see https://git.io/fhLJ8
                            position: 'absolute',
                            right: -6,
                            top: -3,
                            backgroundColor: '#2BD9C8',
                            borderRadius: 6,
                            width: 12,
                            height: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        >
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                            {store.getState().counter.length}
                        </Text>
                        </View>
                    )}
                    </View>
                    
                );
            } else if (route.name === 'Search') {
                iconName = focused ? 'md-search' : 'md-search';
            } else if (route.name === 'Contact') {
                iconName = focused ? 'md-contacts' : 'md-contacts';
            }
              // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
            },
        })}
        tabBarOptions={{
            activeTintColor: '#2BD9C8',
            inactiveTintColor: '#AFAEAF',
        }}
        >
            <Tab.Screen name="Shop" component={createProductStack} />
            <Tab.Screen name="Cart" component={createCartStack} />
            <Tab.Screen name="Search" component={createSearchStack} />
            <Tab.Screen name="Contact" component={ContactScreen} />
        </Tab.Navigator>
    );

}

function createOrderStack() {
    return(
        <OrderStack.Navigator initialRouteName="OrderHistory">
            <OrderStack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ headerShown: false, header: null}} />
            <OrderStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ headerShown: false, header: null}} />
        </OrderStack.Navigator>
    )
}

function createProductStack(){
    return(
        <ProductStack.Navigator>
            <ProductStack.Screen 
                name="Shop" 
                component={ShopScreen} 
                options={{  headerShown: false, header: null }}
            />
            <ProductStack.Screen name="Detail" component={DetailScreen} options={{ headerShown: false, header: null}} />
            <ProductStack.Screen name="ListProduct" component={ListProductScreen} options={{ headerShown: false, header: null}} />
        </ProductStack.Navigator>
    )
    
} 


function createCartStack(){
    return(
        <CartStack.Navigator>
            <CartStack.Screen 
                name="Cart" 
                component={CartScreen} 
                options={{  headerShown: false, header: null }} 
            />
            <CartStack.Screen name="Detail" component={DetailScreen} options={{ headerShown: false, header: null}} />
        </CartStack.Navigator>
    )
    
} 
        

function createSearchStack(){
    return(
        <SearchStack.Navigator>
            <SearchStack.Screen 
                name="Search" 
                component={SearchScreen} 
                options={{  headerShown: false, header: null }} 
            />
            <SearchStack.Screen name="Detail" component={DetailScreen} options={{ headerShown: false, header: null}} />
        </SearchStack.Navigator>
    )
    
} 





// Screen

function Profile({navigation}){
    return(
        <ProfileStack.Navigator>
            <ProfileStack.Screen 
                name="ChangeInfo" 
                component={ChangeInfoScreen} 
                options={{  headerShown: false, header: null }} 
            />
        </ProfileStack.Navigator>
    )
}

function SignInScreen({ navigation }) {
    return (
        <SignIn navigation={navigation} />
    );
}

function SignUpScreen({ navigation }) {
    return (
        <SignUp navigation={navigation} />
    );
}


function AuthenticationScreen({ navigation }) {
    return (
        <Authentication navigation={navigation} />
    );
}

function ChangeInfoScreen({ navigation }) {
    return (
        <ChangeInfo navigation={navigation} />
    );
}


function OrderHistoryScreen({ navigation }) {
    return (
        <OrderHistory navigation={navigation} />
    );
}

function OrderDetailScreen({ route, navigation }) {
    const { orderId } = route.params;
    return (
        <OrderDetail navigation={navigation} orderId={orderId}/>
    );
}


function ShopScreen({ navigation }) {

    return (
    <Shop navigation={ navigation } />
    );
}

function ContactScreen({ navigation }) {
    return (
    <Contact navigation={navigation} />
    );
}

function SearchScreen({ navigation }) {
    return (
    <Search navigation={navigation} />
    );
}

function CartScreen({ navigation }) {
    return (
    <Cart navigation={navigation} />
    );
}


function DetailScreen({ route, navigation }) {
    const { id } = route.params;
    return (
    <Detail navigation={navigation} id={id}/>
    );
}

function ListProductScreen({ route, navigation }) {
    const { type } = route.params;
    return (
    <ListProduct navigation={navigation} type={type} />
    );
}



const mapStateToProps = state => ({
    counter:state.counter
})

export default connect(mapStateToProps, null)(Index);