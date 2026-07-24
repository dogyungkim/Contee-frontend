export const isDevelopmentAuthBypassEnabled = ({
  isDevelopment,
  requested,
}: {
  isDevelopment: boolean
  requested: boolean
}) => isDevelopment && requested
