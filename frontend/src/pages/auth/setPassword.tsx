"use client";

import { Box, Button, Field, Text, VStack } from "@chakra-ui/react";
import { Branding } from "../../components/my-ui/Branding";
import { FormCard } from "../../components/my-ui/FormCard";
import FloatingLabelInput from "../../components/my-ui/FloatingInputField";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../../api/axios";

export const SetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/validate-password-token", {
          params: { token },
        });
        setUsername(res.data.username);
      } catch (err) {
        console.log(err);
        setError("Invalid or expired link");
      }
    };

    fetchUser();
  }, [token]);

  const handleSubmit = async () => {
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const hasLetterAndNumber = /^(?=.*[A-Za-z])(?=.*\d)/.test(password);
    if (!hasLetterAndNumber) {
      setError("Password must contain at least one letter and one number");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await axios.post("/auth/set-password", {
        token,
        password,
      });

      navigate("/login", {
        replace: true,
        state: {
          runTourAfterLogin: true,
        },
      });
    } catch {
      setError("Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100dvh" bg="bg" px={4} py={{ base: 10, md: 14 }}>
      <VStack gap={6} justify="center">
        <Branding />

        <FormCard
          title="Set Password"
          description="Create a secure password to activate your account."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <VStack gap={5} align="stretch">
              <Box
                px={4}
                py={3}
                rounded="xl"
                borderWidth="1px"
                borderColor="border"
                bg="bg.subtle"
              >
                <Text fontSize="sm" color="fg.muted">
                  Use at least 6 characters and include at least one letter and
                  one number.
                </Text>
              </Box>

              <Field.Root>
                <FloatingLabelInput
                  label="Username"
                  value={username}
                  disabled
                />
              </Field.Root>

              <Field.Root invalid={!!error}>
                <FloatingLabelInput
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field.Root>

              <Field.Root invalid={!!error}>
                <FloatingLabelInput
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field.Root>

              {error && (
                <Box
                  px={4}
                  py={3}
                  rounded="xl"
                  borderWidth="1px"
                  borderColor="border.emphasized"
                  bg="bg.subtle"
                >
                  <Text fontSize="sm" color="status.danger">
                    {error}
                  </Text>
                </Box>
              )}

              <Button
                colorPalette="brand"
                type="submit"
                size="lg"
                rounded="xl"
                loading={loading}
                disabled={!password || !confirmPassword || loading}
                w="full"
              >
                Set Password
              </Button>

              <Text fontSize="sm" color="fg.muted" textAlign="center">
                You will be redirected to login after setting your password.
              </Text>
            </VStack>
          </form>
        </FormCard>
      </VStack>
    </Box>
  );
};
