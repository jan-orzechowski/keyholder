namespace Keyholder.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddRatings : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Ratings",
                c => new
                    {
                        PlayerID = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                        LevelID = c.Int(nullable: false),
                        Value = c.Int(),
                    })
                .PrimaryKey(t => new { t.PlayerID, t.LevelID })
                .ForeignKey("dbo.Levels", t => t.LevelID, cascadeDelete: true)
                .ForeignKey("dbo.AspNetUsers", t => t.PlayerID, cascadeDelete: true)
                .Index(t => t.PlayerID)
                .Index(t => t.LevelID);
            
            AddColumn("dbo.Levels", "AverageRating", c => c.Single());
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Ratings", "PlayerID", "dbo.AspNetUsers");
            DropForeignKey("dbo.Ratings", "LevelID", "dbo.Levels");
            DropIndex("dbo.Ratings", new[] { "LevelID" });
            DropIndex("dbo.Ratings", new[] { "PlayerID" });
            DropColumn("dbo.Levels", "AverageRating");
            DropTable("dbo.Ratings");
        }
    }
}
