{mode === 'login' && (
  <>
    <div className="mt-3 text-center">
      <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary underline-offset-4 hover:underline">
        Forgot Password?
      </button>
    </div>

    <div className="mt-4">
      <Button type="button" variant="outline" className="w-full" onClick={handleGuestLogin} disabled={loading}>
        <User className="mr-2 h-4 w-4" />
        {loading ? "Please wait..." : "Continue as Guest"}
      </Button>