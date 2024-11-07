import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useDispatch } from 'react-redux';
import { login } from '../../store/auth/authSlice';
import styles from './LoginForm.module.scss';

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // Track keyboard visibility

  const onFinish = (values: { username: string; password: string }) => {
    setLoading(true);
    
    // Check if both fields are not empty
    if (values.username && values.password) {
      dispatch(login(values.username)); // Dispatch login action
      message.success('Login successful!'); // Notify user
    } else {
      message.error('Please fill in both fields.'); // Error message
    }
    
    setLoading(false);
  };

  const handleFocus = () => {
    setIsKeyboardVisible(true);
  };

  const handleBlur = () => {
    setIsKeyboardVisible(false);
  };

  return (
    <div className={`${styles.loginContainer} ${isKeyboardVisible ? styles.keyboardVisible : ''}`}>
      <Card title="Welcome Back!" className={styles.loginCard}>
        <Form
          name="login"
          className="login-form"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              placeholder="Username" 
              size="large" 
              onFocus={handleFocus} 
              onBlur={handleBlur} // Handle focus and blur events
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password 
              placeholder="Password" 
              size="large" 
              onFocus={handleFocus} 
              onBlur={handleBlur} // Handle focus and blur events
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginForm;
