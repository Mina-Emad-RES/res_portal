import { Box, Button, Field, Text, VStack } from "@chakra-ui/react";
import { Branding } from "../../components/my-ui/Branding";
import { FormCard } from "../../components/my-ui/FormCard";
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { loginApi } from "../../api";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FloatingLabelInput from "../../components/my-ui/FloatingInputField";
import { useLocation } from "react-router-dom";

export const Login = () => {
  // const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldRunTourAfterLogin = location.state?.runTourAfterLogin === true;

  // useEffect(() => {
  //   if (token) {
  //     navigate("/", { replace: true });
  //   }
  // }, [token, navigate]);

  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!username || !password || password.length < 6) {
      setError("Invalid username or password");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const res = await loginApi(username, password);
      login(res.user, res.access_token);
      if (res.user.role === "CLIENT" && shouldRunTourAfterLogin) {
        navigate("/", {
          replace: true,
          state: { runClientTour: true },
        });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401 || status === 403) {
          setError("Invalid username or password");
        }
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100dvh" bg="bg" px={4} py={{ base: 10, md: 14 }}>
      <VStack gap={6} justify="center">
        <Branding />

        <FormCard
          title="Login"
          description="Sign in to access the reporting workspace."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <VStack gap={5} align="stretch">
              <Field.Root invalid={!!error}>
                <FloatingLabelInput
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Field.Root>

              <Field.Root invalid={!!error}>
                <FloatingLabelInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                disabled={!username || !password || loading}
                w="full"
              >
                Login
              </Button>

              <Text fontSize="sm" color="fg.muted" textAlign="center">
                Use your assigned username and password to continue.
              </Text>
            </VStack>
          </form>
        </FormCard>
      </VStack>
    </Box>
  );
};
