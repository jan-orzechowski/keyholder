using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Keyholder.Startup))]
namespace Keyholder
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
